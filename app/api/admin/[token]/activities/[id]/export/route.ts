import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "data/activities.json");

interface Activity {
  id: string;
  title: string;
  brevoListId: number;
  [key: string]: unknown;
}

interface ActivitiesData {
  folderId: number | null;
  activities: Activity[];
}

function readData(): ActivitiesData {
  const content = readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(content);
}

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
    const data = readData();
    const activity = data.activities.find((a) => a.id === id);

    if (!activity) {
      return NextResponse.json({ error: "Aktivitet hittades inte" }, { status: 404 });
    }

    // Hämta alla deltagare från Brevo (pagination)
    let allContacts: BrevoContact[] = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `https://api.brevo.com/v3/contacts/lists/${activity.brevoListId}/contacts?limit=${limit}&offset=${offset}`,
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
