import { NextRequest, NextResponse } from "next/server";

// Konfigurera upprop här - lägg till fler när det behövs
const PETITIONS = {
  "stoppa-marknadshyror-2026": {
    listId: 3,
    name: "Stoppa Marknadshyror 2026",
  },
  // Lägg till fler upprop här:
  // "annat-upprop-2027": { listId: 4, name: "Annat Upprop 2027" },
} as const;

// Aktivt upprop på startsidan
const ACTIVE_PETITION = "stoppa-marknadshyror-2026";

interface PetitionSignRequest {
  firstName: string;
  lastName: string;
  email: string;
  petitionId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PetitionSignRequest = await request.json();

    const { firstName, lastName, email } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Alla fält måste fyllas i" },
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

    // Hämta uppropets config
    const petitionId = body.petitionId || ACTIVE_PETITION;
    const petition = PETITIONS[petitionId as keyof typeof PETITIONS];

    if (!petition) {
      return NextResponse.json(
        { error: "Ogiltigt upprop" },
        { status: 400 }
      );
    }

    // Skapa/uppdatera kontakt i Brevo via direkt API-anrop
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
          HAS_SIGNED_PETITION: true,
          PETITION_SIGNED_DATE: new Date().toISOString().split("T")[0],
          SOURCE: "hemsida",
        },
        listIds: [petition.listId],
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brevo API error:", response.status, errorText);

      // Om kontakten redan finns, försök uppdatera istället
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
                HAS_SIGNED_PETITION: true,
                PETITION_SIGNED_DATE: new Date().toISOString().split("T")[0],
                SOURCE: "hemsida",
              },
              listIds: [petition.listId],
            }),
          }
        );

        if (!updateResponse.ok) {
          const updateError = await updateResponse.text();
          console.error("Update also failed:", updateError);
          throw new Error("Kunde inte spara underskriften");
        }

        console.log("Contact updated successfully");
      } else {
        throw new Error(`Brevo API error: ${response.status}`);
      }
    } else {
      console.log("Contact created successfully");
    }

    return NextResponse.json({
      success: true,
      message: "Tack för din underskrift!",
    });
  } catch (error) {
    console.error("Error signing petition:", error);

    return NextResponse.json(
      { error: "Något gick fel. Försök igen." },
      { status: 500 }
    );
  }
}
