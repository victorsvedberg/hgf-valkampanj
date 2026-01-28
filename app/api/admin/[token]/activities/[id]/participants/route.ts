import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function validateToken(token: string): boolean {
  return token === process.env.ADMIN_SECRET_TOKEN;
}

interface BrevoContact {
  id: number;
  email: string;
  attributes: {
    FIRSTNAME?: string;
    LASTNAME?: string;
    SMS?: string;
    POSTALCODE?: string;
    [key: string]: unknown;
  };
  createdAt: string;
}

// GET - Hämta deltagare för en aktivitet
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; id: string }> }
) {
  const { token, id } = await params;

  if (!validateToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Hitta aktiviteten
    const rows = await sql`
      SELECT id, brevo_list_id FROM activities WHERE id = ${id}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Aktivitet hittades inte" }, { status: 404 });
    }

    const activity = rows[0];

    // Hämta deltagare från Brevo
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const response = await fetch(
      `https://api.brevo.com/v3/contacts/lists/${activity.brevo_list_id}/contacts?limit=${limit}&offset=${offset}`,
      {
        headers: { "api-key": process.env.BREVO_API_KEY! },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Brevo API error: ${errorText}`);
    }

    const result = await response.json();

    // Formatera deltagare
    const participants = result.contacts.map((contact: BrevoContact) => ({
      id: contact.id,
      email: contact.email,
      firstName: contact.attributes.FIRSTNAME || "",
      lastName: contact.attributes.LASTNAME || "",
      phone: contact.attributes.SMS || "",
      postalCode: contact.attributes.POSTALCODE || "",
      registeredAt: contact.createdAt,
    }));

    return NextResponse.json({
      participants,
      total: result.count,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Något gick fel" },
      { status: 500 }
    );
  }
}
