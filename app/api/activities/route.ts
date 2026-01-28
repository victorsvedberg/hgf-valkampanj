import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// GET - Hämta alla publika aktiviteter (framtida)
export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const rows = await sql`
      SELECT
        id, title, description, date, time, location,
        postnummer, kommun, kommun_kod, lan, is_online
      FROM activities
      WHERE date >= ${today}
      ORDER BY date ASC
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
    }));

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ activities: [] });
  }
}
