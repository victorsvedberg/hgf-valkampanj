import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

// POST - Anmäl till aktivitet
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body: RegisterRequest = await request.json();
    const { firstName, lastName, email, phone } = body;

    // Validera
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Förnamn, efternamn och e-post krävs" },
        { status: 400 }
      );
    }

    // Hitta aktiviteten
    const rows = await sql`
      SELECT id, title, brevo_list_id FROM activities WHERE id = ${id}
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Aktiviteten hittades inte" },
        { status: 404 }
      );
    }

    const activity = rows[0];

    // Bygg attribut
    const attributes: Record<string, string | boolean> = {
      FIRSTNAME: firstName,
      LASTNAME: lastName,
      SOURCE: "aktivitet",
    };

    if (phone) {
      // Formatera telefonnummer
      let formattedPhone = phone.replace(/[\s-]/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "+46" + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+46" + formattedPhone;
      }
      attributes.SMS = formattedPhone;
    }

    // Skapa/uppdatera kontakt i Brevo och lägg till i aktivitetens lista
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        attributes,
        listIds: [activity.brevo_list_id],
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brevo API error:", response.status, errorText);

      // Om kontakten finns, uppdatera och lägg till i listan
      if (response.status === 400 && errorText.includes("duplicate")) {
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
              listIds: [activity.brevo_list_id],
            }),
          }
        );

        if (!updateResponse.ok) {
          const updateError = await updateResponse.text();
          console.error("Update failed:", updateError);
          throw new Error("Kunde inte registrera anmälan");
        }
      } else {
        throw new Error("Kunde inte registrera anmälan");
      }
    }

    return NextResponse.json({
      success: true,
      message: "Du är nu anmäld!",
      activity: activity.title,
    });
  } catch (error) {
    console.error("Error registering for activity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Något gick fel" },
      { status: 500 }
    );
  }
}
