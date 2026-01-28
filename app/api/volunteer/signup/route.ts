import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, getVolunteerLimiter } from "@/lib/rate-limit";

// Lista för volontärer/aktiva medlemmar
const VOLUNTEER_LIST_ID = 7; // Skapa i Brevo: "Aktiva medlemmar 2026"

interface VolunteerSignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  postalCode: string;
  region: string;
  interests: string[];
  experience?: string;
  availability?: string;
  acceptContact: boolean;
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(
    getVolunteerLimiter(),
    getClientIp(request)
  );
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body: VolunteerSignupRequest = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      postalCode,
      region,
      interests,
      experience,
      availability,
      acceptContact,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !postalCode || !region) {
      return NextResponse.json(
        { error: "Alla obligatoriska fält måste fyllas i" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Ogiltig e-postadress" },
        { status: 400 }
      );
    }

    // Bygg attribut
    const attributes: Record<string, string | boolean> = {
      FIRSTNAME: firstName,
      LASTNAME: lastName,
      POSTALCODE: postalCode.replace(/\s/g, ""),
      IS_VOLUNTEER: true,
      VOLUNTEER_SIGNUP_DATE: new Date().toISOString().split("T")[0],
      VOLUNTEER_REGION: region,
      WANTS_NEWSLETTER: acceptContact,
      SOURCE: "hemsida",
    };

    // Formatera telefonnummer
    if (phone) {
      let formattedPhone = phone.replace(/[\s-]/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+46" + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+46" + formattedPhone;
      }
      attributes.SMS = formattedPhone;
    }

    // Lägg till intressen som kommaseparerad lista
    if (interests && interests.length > 0) {
      attributes.VOLUNTEER_INTERESTS = interests.join(",");
    }

    // Lägg till valfria fält
    if (experience) {
      attributes.VOLUNTEER_EXPERIENCE = experience;
    }
    if (availability) {
      attributes.VOLUNTEER_AVAILABILITY = availability;
    }

    console.log("Creating volunteer contact:", email, attributes);

    // Skapa/uppdatera kontakt i Brevo
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        attributes,
        listIds: [VOLUNTEER_LIST_ID],
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brevo API error:", response.status, errorText);

      // Om kontakten redan finns, försök uppdatera
      if (response.status === 400 && errorText.includes("duplicate")) {
        console.log("Contact exists, trying update...");

        const updateResponse = await fetch(
          `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
          {
            method: "PUT",
            headers: {
              "api-key": process.env.BREVO_API_KEY!,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              attributes,
              listIds: [VOLUNTEER_LIST_ID],
            }),
          }
        );

        if (!updateResponse.ok) {
          const updateError = await updateResponse.text();
          console.error("Update also failed:", updateError);
          throw new Error("Kunde inte spara anmälan");
        }

        console.log("Volunteer contact updated successfully");
      } else {
        throw new Error(`Brevo API error: ${response.status}`);
      }
    } else {
      console.log("Volunteer contact created successfully");
    }

    return NextResponse.json({
      success: true,
      message: "Tack för din anmälan!",
    });
  } catch (error) {
    console.error("Error processing volunteer signup:", error);

    return NextResponse.json(
      { error: "Något gick fel. Försök igen." },
      { status: 500 }
    );
  }
}
