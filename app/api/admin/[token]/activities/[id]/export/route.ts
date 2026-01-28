import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function validateToken(token: string): boolean {
  return token === process.env.ADMIN_SECRET_TOKEN;
}

interface BrevoContact {
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

// GET - Exportera deltagarlista som CSV
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
      SELECT id, title, brevo_list_id FROM activities WHERE id = ${id}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: "Aktivitet hittades inte" }, { status: 404 });
    }

    const activity = rows[0];

    // Hämta alla deltagare från Brevo (pagination)
    let allContacts: BrevoContact[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `https://api.brevo.com/v3/contacts/lists/${activity.brevo_list_id}/contacts?limit=${limit}&offset=${offset}`,
        {
          headers: { "api-key": process.env.BREVO_API_KEY! },
        }
      );

      if (!response.ok) {
        throw new Error("Kunde inte hämta deltagare från Brevo");
      }

      const result = await response.json();
      allContacts = [...allContacts, ...result.contacts];
      offset += limit;
      hasMore = result.contacts.length === limit;
    }

    // Skapa CSV
    const csvHeader = "Förnamn,Efternamn,E-post,Telefon,Postnummer,Registrerad";
    const csvRows = allContacts.map((contact) => {
      const firstName = contact.attributes.FIRSTNAME || "";
      const lastName = contact.attributes.LASTNAME || "";
      const phone = contact.attributes.SMS || "";
      const postalCode = contact.attributes.POSTALCODE || "";
      const registeredAt = new Date(contact.createdAt).toLocaleDateString("sv-SE");

      // Escape CSV values
      const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;

      return [
        escape(firstName),
        escape(lastName),
        escape(contact.email),
        escape(phone),
        escape(postalCode),
        escape(registeredAt),
      ].join(",");
    });

    const csv = [csvHeader, ...csvRows].join("\n");

    // Skapa filnamn
    const fileName = `${activity.title.replace(/[^a-zA-Z0-9åäöÅÄÖ\s-]/g, "")}-deltagare.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting participants:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Något gick fel" },
      { status: 500 }
    );
  }
}
