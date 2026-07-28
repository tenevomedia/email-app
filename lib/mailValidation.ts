export const MAX_EMAIL_RECIPIENTS = 50;
export const MAX_SUBJECT_LENGTH = 998;
export const MAX_BODY_LENGTH = 100_000;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseRecipients(value: string): string[] {
  const recipients = value
    .split(/[,;\n]/)
    .map((recipient) => recipient.trim())
    .filter(Boolean);

  if (recipients.length === 0) throw new Error("Mindestens ein Empfänger ist erforderlich.");
  if (recipients.length > MAX_EMAIL_RECIPIENTS) throw new Error(`Maximal ${MAX_EMAIL_RECIPIENTS} Empfänger sind erlaubt.`);
  if (recipients.some((recipient) => !emailPattern.test(recipient))) {
    throw new Error("Mindestens eine E-Mail-Adresse ist ungültig.");
  }

  return [...new Set(recipients.map((recipient) => recipient.toLowerCase()))];
}

export function validateOutgoingEmail(input: unknown) {
  if (!input || typeof input !== "object") throw new Error("Ungültige Anfrage.");
  const value = input as Record<string, unknown>;
  const fromEmail = typeof value.fromEmail === "string" ? value.fromEmail.trim() : "";
  const toEmail = typeof value.toEmail === "string" ? value.toEmail : "";
  const cc = typeof value.cc === "string" ? value.cc : "";
  const subject = typeof value.subject === "string" ? value.subject.trim() : "";
  const bodyText = typeof value.bodyText === "string" ? value.bodyText : "";

  if (!emailPattern.test(fromEmail)) throw new Error("Die Absenderadresse ist ungültig.");
  if (subject.length > MAX_SUBJECT_LENGTH) throw new Error("Der Betreff ist zu lang.");
  if (bodyText.length > MAX_BODY_LENGTH) throw new Error("Der Nachrichtentext ist zu lang.");

  return {
    fromEmail,
    to: parseRecipients(toEmail),
    cc: cc.trim() ? parseRecipients(cc) : [],
    subject,
    bodyText,
  };
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] as string);
}
