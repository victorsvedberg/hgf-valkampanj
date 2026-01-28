import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const BREVO_FOLDER_NAME = "Aktiviteter";

function validateToken(token: string): boolean {
  return token === process.env.ADMIN_SECRET_TOKEN;
}

// Skapa eller hämta "Aktiviteter"-mappen i Brevo
async function getOrCreateFolder(): Promise<number> {
  // Försök hämta befintlig folder-id från en aktivitet
  const existing = await sql`
    SELECT brevo_folder_id FROM activities WHERE brevo_folder_id IS NOT NULL LIMIT 1
  `;

  if (existing.length > 0 && existing[0].brevo_folder_id) {
    return existing[0].brevo_folder_id;
  }

  // Skapa mappen
  const response = await fetch("https://api.brevo.com/v3/contacts/folders", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: BREVO_FOLDER_NAME }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Om mappen redan finns, försök hitta den
    if (response.status === 400 && errorText.includes("already exists")) {
      // Hämta alla mappar och hitta rätt
      const foldersRes = await fetch("https://api.brevo.com/v3/contacts/folders?limit=50", {
        headers: { "api-key": process.env.BREVO_API_KEY! },
      });
      const foldersData = await foldersRes.json();
      const folder = foldersData.folders?.find((f: { name: string }) => f.name === BREVO_FOLDER_NAME);
      if (folder) {
        return folder.id;
      }
    }
    throw new Error(`Kunde inte skapa Brevo-mapp: ${errorText}`);
  }

  const result = await response.json();
  return result.id;
}

// Skapa Brevo-lista för aktivitet
async function createBrevoList(name: string, folderId: number): Promise<number> {
  const response = await fetch("https://api.brevo.com/v3/contacts/lists", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, folderId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Kunde inte skapa Brevo-lista: ${errorText}`);
  }

  const result = await response.json();
  return result.id;
}

// GET - Lista alla aktiviteter
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!validateToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await sql`
      SELECT * FROM activities ORDER BY date ASC
    `;

    const activities = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description || "",
      date: row.date,
      time: row.time,
      location: row.location || "",
      postnummer: row.postnummer || "",
      kommun: row.kommun || "",
      kommunKod: row.kommun_kod || "",
      lan: row.lan || "",
      isOnline: row.is_online || false,
      brevoListId: row.brevo_list_id,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Något gick fel" },
      { status: 500 }
    );
  }
}

// POST - Skapa ny aktivitet
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!validateToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, date, time, location, postnummer, kommun, kommunKod, lan, isOnline } = body;

    // Validera
    if (!title || !date || !time) {
      return NextResponse.json(
        { error: "Titel, datum och tid krävs" },
        { status: 400 }
      );
    }

    // Skapa/hämta Brevo-mapp
    const folderId = await getOrCreateFolder();

    // Skapa Brevo-lista med unik namn
    const listName = `${title} - ${date}`;
    const brevoListId = await createBrevoList(listName, folderId);

    // Skapa aktivitet
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await sql`
      INSERT INTO activities (
        id, title, description, date, time, location,
        postnummer, kommun, kommun_kod, lan, is_online,
        brevo_list_id, brevo_folder_id, created_at
      )
      VALUES (
        ${id}, ${title}, ${description || ""}, ${date}, ${time}, ${location || ""},
        ${postnummer || ""}, ${kommun || ""}, ${kommunKod || ""}, ${lan || ""}, ${isOnline || false},
        ${brevoListId}, ${folderId}, ${createdAt}
      )
    `;

    const activity = {
      id,
      title,
      description: description || "",
      date,
      time,
      location: location || "",
      postnummer: postnummer || "",
      kommun: kommun || "",
      kommunKod: kommunKod || "",
      lan: lan || "",
      isOnline: isOnline || false,
      brevoListId,
      createdAt,
    };

    return NextResponse.json({ success: true, activity }, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Något gick fel" },
      { status: 500 }
    );
  }
}
