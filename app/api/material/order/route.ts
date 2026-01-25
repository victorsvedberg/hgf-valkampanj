import { NextRequest, NextResponse } from "next/server";

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

    // Skapa/uppdatera kontakt i Brevo
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          SMS: phone || undefined,
          POSTALCODE: postalCode,
          CITY: city,
          ADDRESS: address,
          HAS_ORDERED_MATERIAL: true,
          MATERIAL_ORDER_DATE: new Date().toISOString().split("T")[0],
          MATERIAL_QUANTITY: quantity,
          MATERIAL_MESSAGE: message || undefined,
          SOURCE: "hemsida",
        },
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
              attributes: {
                FIRSTNAME: firstName,
                LASTNAME: lastName,
                SMS: phone || undefined,
                POSTALCODE: postalCode,
                CITY: city,
                ADDRESS: address,
                HAS_ORDERED_MATERIAL: true,
                MATERIAL_ORDER_DATE: new Date().toISOString().split("T")[0],
                MATERIAL_QUANTITY: quantity,
                MATERIAL_MESSAGE: message || undefined,
                SOURCE: "hemsida",
              },
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
