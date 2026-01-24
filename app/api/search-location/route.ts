import { NextRequest, NextResponse } from "next/server";
import postalData from "@/data/postnummer.json";

interface OrtEntry {
  ort: string;
  kommun: string;
  kommunKod: string;
  lan: string;
  examplePostnummer: string;
}

interface PostnummerEntry {
  ort: string;
  kommun: string;
  kommunKod: string;
  lan: string;
}

interface PostalData {
  orter: OrtEntry[];
  postnummerLookup: Record<string, PostnummerEntry>;
  kommuner: string[];
}

const data = postalData as PostalData;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results: Array<{
    type: "postnummer" | "ort";
    display: string;
    ort: string;
    kommun: string;
    kommunKod: string;
    lan: string;
    postnummer?: string;
  }> = [];

  // Kolla om det är ett postnummer (börjar med siffra)
  const cleanQuery = query.replace(/\s/g, "");
  const isPostalCode = /^\d+$/.test(cleanQuery);

  if (isPostalCode) {
    // Sök efter postnummer som börjar med query
    const matchingPostnummer = Object.entries(data.postnummerLookup)
      .filter(([postnummer]) => postnummer.startsWith(cleanQuery))
      .slice(0, limit);

    for (const [postnummer, entry] of matchingPostnummer) {
      // Formatera postnummer med mellanslag (123 45)
      const formattedPostnummer = postnummer.slice(0, 3) + " " + postnummer.slice(3);
      results.push({
        type: "postnummer",
        display: `${formattedPostnummer} ${entry.ort}`,
        ort: entry.ort,
        kommun: entry.kommun,
        kommunKod: entry.kommunKod,
        lan: entry.lan,
        postnummer: postnummer,
      });
    }
  } else {
    // Sök efter ort/kommun
    const lowerQuery = query.toLowerCase();

    // 1. Hitta kommuner som matchar (prioriteras först)
    const matchingKommuner = new Map<string, OrtEntry>();
    for (const entry of data.orter) {
      if (entry.kommun.toLowerCase().startsWith(lowerQuery)) {
        // Spara bara en entry per kommun (den där ort === kommun om möjligt)
        const existing = matchingKommuner.get(entry.kommunKod);
        if (!existing || entry.ort === entry.kommun) {
          matchingKommuner.set(entry.kommunKod, entry);
        }
      }
    }

    // Lägg till kommuner först (max 4)
    const kommunResults = Array.from(matchingKommuner.values()).slice(0, 4);
    for (const entry of kommunResults) {
      results.push({
        type: "ort",
        display: entry.kommun,
        ort: entry.kommun, // Använd kommunnamnet
        kommun: entry.kommun,
        kommunKod: entry.kommunKod,
        lan: entry.lan,
        postnummer: entry.examplePostnummer,
      });
    }

    // 2. Hitta orter som matchar på ortnamn (inte kommun)
    const matchingOrter = data.orter
      .filter((entry) =>
        entry.ort.toLowerCase().startsWith(lowerQuery) &&
        entry.ort !== entry.kommun // Exkludera de som redan visas som kommun
      )
      .slice(0, limit - results.length);

    for (const entry of matchingOrter) {
      results.push({
        type: "ort",
        display: `${entry.ort}, ${entry.kommun}`,
        ort: entry.ort,
        kommun: entry.kommun,
        kommunKod: entry.kommunKod,
        lan: entry.lan,
        postnummer: entry.examplePostnummer,
      });
    }
  }

  return NextResponse.json({ results });
}
