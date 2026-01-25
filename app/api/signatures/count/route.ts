import { NextRequest, NextResponse } from "next/server";
import { getSignatureCount, DEFAULT_PETITION_ID } from "@/lib/signatures";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const petitionId = searchParams.get("petitionId") || DEFAULT_PETITION_ID;

  try {
    const { count, goal } = await getSignatureCount(petitionId);

    return NextResponse.json({
      count,
      goal,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching signature count:", error);

    // Fallback to default values on error
    return NextResponse.json({
      count: 0,
      goal: 10000,
      updatedAt: new Date().toISOString(),
    });
  }
}
