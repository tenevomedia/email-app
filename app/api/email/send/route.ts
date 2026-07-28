import { NextResponse } from "next/server";
import { validateOutgoingEmail } from "@/lib/mailValidation";

export const runtime = "nodejs";

function errorResponse(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Die Anfrage konnte nicht verarbeitet werden.";
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return errorResponse(new Error("Content-Type muss application/json sein."), 415);
    }
    const email = validateOutgoingEmail(await request.json());
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return errorResponse(new Error("Der E-Mail-Versand ist noch nicht eingerichtet. Bitte RESEND_API_KEY konfigurieren."), 503);
    }

    const providerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: email.fromEmail,
        to: email.to,
        ...(email.cc.length ? { cc: email.cc } : {}),
        subject: email.subject || "(Kein Betreff)",
        text: email.bodyText,
      }),
    });
    const providerPayload = await providerResponse.json().catch(() => null) as { id?: string; message?: string } | null;
    if (!providerResponse.ok || !providerPayload?.id) {
      console.error("[API /email/send] Provider error", providerResponse.status, providerPayload?.message);
      return errorResponse(new Error("Die E-Mail konnte nicht versendet werden. Bitte prüfe Absender und Versandkonfiguration."), 502);
    }

    return NextResponse.json({
      success: true,
      messageId: providerPayload.id,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
