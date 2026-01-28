import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, getMaterialLimiter } from "@/lib/rate-limit";

// Lista för materialbeställningar
const MATERIAL_LIST_ID = 6;

interface MaterialOrderRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  postalCode: string;
  city: string;
  quantity: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(
    getMaterialLimiter(),
    getClientIp(request)
  );
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body: MaterialOrderRequest = await request.json();

    const { firstName, lastName, email, phone, address, postalCode, city, quantity, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !address || !postalCode || !city || !quantity) {
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

    // Bygg attribut - endast inkludera fält med värden
    const attributes: Record<string, string | boolean> = {
      FIRSTNAME: firstName,
      LASTNAME: lastName,
      POSTALCODE: postalCode.replace(/\s/g, ""),
      CITY: city,
      ADDRESS: address,
      HAS_ORDERED_MATERIAL: true,
      MATERIAL_ORDER_DATE: new Date().toISOString().split("T")[0],
      MATERIAL_QUANTITY: quantity,
      SOURCE: "hemsida",
    };

    // Formatera telefonnummer om det finns
    if (phone) {
      let formattedPhone = phone.replace(/[\s-]/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+46" + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+46" + formattedPhone;
      }
      attributes.SMS = formattedPhone;
    }

    // Lägg till meddelande om det finns
    if (message) {
      attributes.MATERIAL_MESSAGE = message;
    }

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
        listIds: [MATERIAL_LIST_ID],
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
              listIds: [MATERIAL_LIST_ID],
            }),
          }
        );

        if (!updateResponse.ok) {
          const updateError = await updateResponse.text();
          console.error("Update also failed:", updateError);
          throw new Error("Kunde inte spara beställningen");
        }

        console.log("Contact updated successfully");
      } else {
        throw new Error(`Brevo API error: ${response.status}`);
      }
    } else {
      console.log("Contact created successfully with material order");
    }

    return NextResponse.json({
      success: true,
      message: "Beställningen har tagits emot!",
    });
  } catch (error) {
    console.error("Error processing material order:", error);

    return NextResponse.json(
      { error: "Något gick fel. Försök igen." },
      { status: 500 }
    );
  }
}
