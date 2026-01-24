import { NextRequest, NextResponse } from "next/server";

interface UpdateContactRequest {
  email: string;
  phone?: string;
  postnummer?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdateContactRequest = await request.json();

    const { email, phone, postnummer } = body;

    if (!email) {
      return NextResponse.json(
        { error: "E-post saknas" },
        { status: 400 }
      );
    }

    // Build attributes to update
    const attributes: Record<string, string> = {};

    if (phone) {
      // Formatera telefonnummer - ta bort mellanslag och lägg till +46 om det saknas
      let formattedPhone = phone.replace(/[\s-]/g, "");

      // Om numret börjar med 0, byt till +46
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+46" + formattedPhone.slice(1);
      }
      // Om numret inte har landskod, lägg till +46
      else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+46" + formattedPhone;
      }

      attributes.SMS = formattedPhone;
    }

    if (postnummer) {
      attributes.POSTALCODE = postnummer.replace(/\s/g, "");
    }

    console.log("Updating contact:", email, "with attributes:", attributes);

    // Direkt API-anrop till Brevo (bypassa SDK)
    const response = await fetch(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
      {
        method: "PUT",
        headers: {
          "api-key": process.env.BREVO_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ attributes }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brevo API error:", response.status, errorText);

      // Om SMS redan används av annan kontakt, försök utan SMS
      if (errorText.includes("duplicate_parameter") && errorText.includes("SMS") && attributes.POSTALCODE) {
        console.log("SMS duplicate, trying without SMS...");
        const retryResponse = await fetch(
          `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
          {
            method: "PUT",
            headers: {
              "api-key": process.env.BREVO_API_KEY!,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ attributes: { POSTALCODE: attributes.POSTALCODE } }),
          }
        );

        if (!retryResponse.ok) {
          const retryError = await retryResponse.text();
          console.error("Retry also failed:", retryError);
          throw new Error("Kunde inte uppdatera kontakten");
        }

        console.log("Contact updated without SMS (SMS already in use)");
        return NextResponse.json({
          success: true,
          message: "Postnummer sparat! (Mobilnumret är redan registrerat)",
          warning: "phone_duplicate",
        });
      }

      throw new Error(`Brevo API error: ${response.status} ${errorText}`);
    }

    console.log("Contact updated successfully");

    return NextResponse.json({
      success: true,
      message: "Uppgifter uppdaterade!",
    });
  } catch (error: unknown) {
    console.error("Error updating contact:", error);
    console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    return NextResponse.json(
      { error: "Något gick fel. Försök igen." },
      { status: 500 }
    );
  }
}
