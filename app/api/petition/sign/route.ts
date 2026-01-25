import { NextRequest, NextResponse } from "next/server";
import {
  addSignature,
  getPetition,
  DEFAULT_PETITION_ID,
} from "@/lib/signatures";

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
    const petitionId = body.petitionId || DEFAULT_PETITION_ID;
    const petition = await getPetition(petitionId);

    if (!petition) {
      return NextResponse.json({ error: "Ogiltigt upprop" }, { status: 400 });
    }

    // 1. Spara lokalt FÖRST (snabbt för optimistic updates)
    const { newCount, displayName } = await addSignature(petitionId, firstName);

    // 2. Skicka till Brevo async (don't await)
    sendToBrevo({
      email,
      firstName,
      lastName,
      listId: petition.brevoListId,
    }).catch((err) => {
      console.error("Brevo sync failed (will retry later):", err);
    });

    return NextResponse.json({
      success: true,
      message: "Tack för din underskrift!",
      newCount,
      displayName,
    });
  } catch (error) {
    console.error("Error signing petition:", error);

    return NextResponse.json(
      { error: "Något gick fel. Försök igen." },
      { status: 500 }
    );
  }
}

/**
 * Send signature to Brevo CRM (async, non-blocking)
 */
async function sendToBrevo({
  email,
  firstName,
  lastName,
  listId,
}: {
  email: string;
  firstName: string;
  lastName: string;
  listId: number;
}) {
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
      listIds: [listId],
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
            listIds: [listId],
          }),
        }
      );

      if (!updateResponse.ok) {
        const updateError = await updateResponse.text();
        console.error("Update also failed:", updateError);
        throw new Error("Kunde inte spara underskriften i Brevo");
      }

      console.log("Contact updated successfully in Brevo");
    } else {
      throw new Error(`Brevo API error: ${response.status}`);
    }
  } else {
    console.log("Contact created successfully in Brevo");
  }
}
