import { NextRequest, NextResponse } from "next/server";
import { updatePetitionCount, DEFAULT_PETITION_ID } from "@/lib/signatures";

/**
 * Internal endpoint to sync signature count from Brevo
 * Should be called by a cron job every 5 minutes
 *
 * Requires INTERNAL_API_KEY for authentication
 */
export async function POST(request: NextRequest) {
  // Verify internal API key
  const authHeader = request.headers.get("x-api-key");
  const expectedKey = process.env.INTERNAL_API_KEY;

  if (!expectedKey || authHeader !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const petitionId = body.petitionId || DEFAULT_PETITION_ID;
    const brevoListId = body.listId || 3;

    // Fetch contact count from Brevo list
    const response = await fetch(
      `https://api.brevo.com/v3/contacts/lists/${brevoListId}`,
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brevo API error:", response.status, errorText);
      throw new Error(`Brevo API error: ${response.status}`);
    }

    const data = await response.json();
    const count = data.totalSubscribers || data.uniqueSubscribers || 0;

    // Update local petition count
    await updatePetitionCount(petitionId, count);

    console.log(
      `Synced Brevo list ${brevoListId} -> petition ${petitionId}: ${count} signatures`
    );

    return NextResponse.json({
      success: true,
      petitionId,
      count,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error syncing with Brevo:", error);

    return NextResponse.json(
      { error: "Failed to sync with Brevo" },
      { status: 500 }
    );
  }
}
