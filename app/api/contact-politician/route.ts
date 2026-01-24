import { NextRequest, NextResponse } from "next/server";

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

    // 1. Skicka mejl till politiker via Brevo Transactional API
    const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: `${userName} via ${process.env.BREVO_SENDER_NAME}`,
          email: process.env.BREVO_SENDER_EMAIL,
        },
        replyTo: {
          name: userName,
          email: userEmail,
        },
        to: [
          {
            email: politicianEmail,
            name: politicianName,
          },
        ],
        subject: "Fråga om marknadshyror",
        htmlContent: `<div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #333;">${message.replace(/\n/g, "<br>")}</div>`,
        textContent: message,
        tags: ["politiker-kontakt"],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Brevo email error:", emailResponse.status, errorText);
      throw new Error("Kunde inte skicka mejlet");
    }

    console.log("Email sent successfully");

    // 2. Uppdatera/skapa kontakt i Brevo
    const nameParts = userName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || undefined;

    const attributes: Record<string, string | boolean> = {
      FIRSTNAME: firstName,
      HAS_CONTACTED_POLITICIAN: true,
      LAST_POLITICIAN_CONTACT: new Date().toISOString().split("T")[0],
    };

    if (lastName) attributes.LASTNAME = lastName;
    if (postnummer) attributes.POSTALCODE = postnummer;
    if (kommun) attributes.MUNICIPALITY = kommun;

    // Försök skapa kontakt
    const contactResponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        attributes,
        updateEnabled: true,
      }),
    });

    if (!contactResponse.ok) {
      const errorText = await contactResponse.text();

      // Om kontakten finns, uppdatera
      if (contactResponse.status === 400 && errorText.includes("duplicate")) {
        const updateResponse = await fetch(
          `https://api.brevo.com/v3/contacts/${encodeURIComponent(userEmail)}`,
          {
            method: "PUT",
            headers: {
              "api-key": process.env.BREVO_API_KEY!,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ attributes }),
          }
        );

        if (!updateResponse.ok) {
          console.error("Contact update failed:", await updateResponse.text());
          // Fortsätt ändå - mejlet skickades
        } else {
          console.log("Contact updated");
        }
      } else {
        console.error("Contact creation failed:", errorText);
        // Fortsätt ändå - mejlet skickades
      }
    } else {
      console.log("Contact created");
    }

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
