import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Hämta riktigt antal från Brevo eller databas
  // Exempel med Brevo:
  // const response = await fetch("https://api.brevo.com/v3/contacts", {
  //   headers: { "api-key": process.env.BREVO_API_KEY! },
  // });
  // const data = await response.json();
  // return NextResponse.json({ count: data.count });

  // Dummy-data för nu
  const count = 6713;

  return NextResponse.json({
    count,
    goal: 10000,
    updatedAt: new Date().toISOString(),
  });
}
