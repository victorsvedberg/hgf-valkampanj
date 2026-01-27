import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase, seedDefaultPetition } from "@/lib/db";

/**
 * Initialize database tables and seed default data
 * Run once after deploying to set up the schema
 *
 * Protected by INTERNAL_API_KEY
 */
export async function POST(request: NextRequest) {
  // Verify internal API key
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initializeDatabase();
    await seedDefaultPetition();

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
