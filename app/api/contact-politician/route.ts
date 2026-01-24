import { NextRequest, NextResponse } from "next/server";
import { sendPoliticianEmail, updateOrCreateContact } from "@/lib/brevo";

interface ContactPoliticianRequest {
  userName: string;
  userEmail: string;
  politicianEmail: string;
  politicianName: string;
  message: string;
  postnummer?: string;
  kommun?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactPoliticianRequest = await request.json();

    const { userName, userEmail, politicianEmail, politicianName, message, postnummer, kommun } = body;

    // Validate required fields
    if (!userName || !userEmail || !politicianEmail || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail) || !emailRegex.test(politicianEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // 1. Send email to politician
    await sendPoliticianEmail({
      userName,
      userEmail,
      politicianEmail,
      politicianName,
      message,
    });

    // 2. Update/create contact in Brevo with tracking
    const nameParts = userName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || undefined;

    await updateOrCreateContact({
      email: userEmail,
      firstName,
      lastName,
      attributes: {
        HAS_CONTACTED_POLITICIAN: true,
        LAST_POLITICIAN_CONTACT: new Date().toISOString().split("T")[0],
        ...(postnummer && { POSTNUMMER: postnummer }),
        ...(kommun && { KOMMUN: kommun }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error sending politician email:", error);

    return NextResponse.json(
      { error: "Failed to send email. Please try again." },
      { status: 500 }
    );
  }
}
