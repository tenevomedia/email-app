import { NextResponse } from "next/server";
import { uploadAttachmentToS3 } from "@/lib/storage/s3";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen." }, { status: 400 });
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
  } catch (error: any) {
    console.error("[API /attachments/upload] S3 Upload Fehler:", error);
    return NextResponse.json(
      { error: error.message || "Fehler beim Hochladen der Datei auf S3." },
      { status: 500 }
    );
  }
}
