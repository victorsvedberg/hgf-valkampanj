import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "data/activities.json");

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
  isOnline: boolean;
  brevoListId: number;
  createdAt: string;
}

interface ActivitiesData {
  folderId: number | null;
  activities: Activity[];
}

// GET - Hämta alla publika aktiviteter (framtida)
export async function GET() {
  try {
    const content = readFileSync(DATA_PATH, "utf-8");
    const data: ActivitiesData = JSON.parse(content);

    // Filtrera bort gamla aktiviteter
    const today = new Date().toISOString().split("T")[0];
    const upcomingActivities = data.activities
      .filter((a) => a.date >= today)
      .map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        date: a.date,
        time: a.time,
        location: a.location,
        postnummer: a.postnummer,
        kommun: a.kommun,
        kommunKod: a.kommunKod,
        lan: (a as Activity & { lan?: string }).lan || "",
        isOnline: a.isOnline,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({ activities: upcomingActivities });
  } catch {
    return NextResponse.json({ activities: [] });
  }
}
