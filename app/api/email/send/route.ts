import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fromEmail, toEmail, cc, subject, bodyText } = body;

    if (!fromEmail || !toEmail) {
      return NextResponse.json(
        { error: "Absender (fromEmail) und Empfänger (toEmail) sind erforderlich." },
        { status: 400 }
      );
    }

    console.log(`[API /email/send] Sende E-Mail von ${fromEmail} an ${toEmail}: "${subject}"`);

    // In a production environment with Nodemailer/SES/Resend:
    // await transporter.sendMail({ from: fromEmail, to: toEmail, cc, subject, text: bodyText });

    return NextResponse.json({
      success: true,
      message: `E-Mail erfolgreich von ${fromEmail} an ${toEmail} versendet!`,
      messageId: `msg-${Date.now()}`
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Fehler beim Versenden der E-Mail." },
      { status: 500 }
    );
  }
}
