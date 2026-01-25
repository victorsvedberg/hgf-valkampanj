import { NextRequest, NextResponse } from "next/server";
import { getRecentSigners, DEFAULT_PETITION_ID } from "@/lib/signatures";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const petitionId = searchParams.get("petitionId") || DEFAULT_PETITION_ID;
  const limit = Math.min(
    Math.max(1, parseInt(searchParams.get("limit") || "5", 10)),
    10
  );

  try {
    const signers = await getRecentSigners(petitionId, limit);

    return NextResponse.json({
      signers,
      petitionId,
    });
  } catch (error) {
    console.error("Error fetching recent signers:", error);

    return NextResponse.json({
      signers: [],
      petitionId,
    });
  }
}
