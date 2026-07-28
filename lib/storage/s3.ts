import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configure S3 Client for Cloudflare R2 / AWS S3 / MinIO
const s3Region = process.env.S3_REGION || "auto";
const s3Endpoint = process.env.S3_ENDPOINT; // e.g. "https://<account_id>.r2.cloudflarestorage.com"
const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID || "";
const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY || "";
const bucketName = process.env.S3_BUCKET_NAME || "email-app-attachments";
const publicUrlBase = process.env.S3_PUBLIC_URL; // e.g. "https://media.deinedomain.cc"

export const s3Client = new S3Client({
  region: s3Region,
  endpoint: s3Endpoint,
  credentials: {
    accessKeyId: s3AccessKeyId,
    secretAccessKey: s3SecretAccessKey,
  },
});

export interface UploadResult {
  key: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

/**
 * Uploads a file buffer to S3 / Cloudflare R2
 */
export async function uploadAttachmentToS3(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadResult> {
  const fileKey = `attachments/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  const fileUrl = publicUrlBase 
    ? `${publicUrlBase.replace(/\/$/, "")}/${fileKey}`
    : `${s3Endpoint ? s3Endpoint.replace(/\/$/, "") : ""}/${bucketName}/${fileKey}`;

  return {
    key: fileKey,
    url: fileUrl,
    filename,
    size: fileBuffer.length,
    mimeType,
  };
}

/**
 * Generates a presigned URL for secure temporary file downloads
 */
export async function getPresignedDownloadUrl(fileKey: string, expiresInSeconds = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

/**
 * Deletes an attachment from S3 / R2
 */
export async function deleteAttachmentFromS3(fileKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });

  await s3Client.send(command);
}
