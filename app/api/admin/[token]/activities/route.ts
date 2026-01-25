import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "data/activities.json");
const BREVO_FOLDER_NAME = "Aktiviteter";

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  postnummer: string;
  kommun: string;
  kommunKod: string;
  lan: string;
  isOnline: boolean;
  brevoListId: number;
  createdAt: string;
}

interface ActivitiesData {
  folderId: number | null;
  activities: Activity[];
}

function readData(): ActivitiesData {
  const content = readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(content);
}

function writeData(data: ActivitiesData): void {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function validateToken(token: string): boolean {
  return token === process.env.ADMIN_SECRET_TOKEN;
}

// Skapa eller hämta "Aktiviteter"-mappen i Brevo
async function getOrCreateFolder(): Promise<number> {
  const data = readData();

  if (data.folderId) {
    return data.folderId;
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
        data.folderId = folder.id;
        writeData(data);
        return folder.id;
      }
    }
    throw new Error(`Kunde inte skapa Brevo-mapp: ${errorText}`);
  }

  const result = await response.json();
  data.folderId = result.id;
  writeData(data);
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

  const data = readData();
  return NextResponse.json({ activities: data.activities });
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
    const activity: Activity = {
      id: crypto.randomUUID(),
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
      createdAt: new Date().toISOString(),
    };

    // Spara
    const data = readData();
    data.activities.push(activity);
    writeData(data);

    return NextResponse.json({ success: true, activity }, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Något gick fel" },
      { status: 500 }
    );
  }
}
