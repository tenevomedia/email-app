import { NextResponse } from "next/server";
import { isAttachmentStorageConfigured, uploadAttachmentToS3 } from "@/lib/storage/s3";

export const runtime = "nodejs";

const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    if (!isAttachmentStorageConfigured()) {
      return NextResponse.json({ error: "Der Anhangsspeicher ist noch nicht eingerichtet." }, { status: 503 });
    }
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Keine Datei hochgeladen." }, { status: 400 });
    }
    if (file.size > MAX_ATTACHMENT_SIZE) {
      return NextResponse.json({ error: "Anhänge dürfen maximal 25 MB groß sein." }, { status: 413 });
    }
    if (file.name.length > 255) {
      return NextResponse.json({ error: "Der Dateiname ist zu lang." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to S3 / Cloudflare R2
    const uploadResult = await uploadAttachmentToS3(
      buffer,
      file.name,
      file.type || "application/octet-stream"
    );

    return NextResponse.json({
      success: true,
      attachment: uploadResult,
    });
  } catch (error) {
    console.error("[API /attachments/upload] S3 Upload Fehler:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fehler beim Hochladen der Datei auf S3." },
      { status: 500 }
    );
  }
}
