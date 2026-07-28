/**
 * Centralized Environment & Runtime Variables Configuration
 * Guarantees fallbacks and typed access for Cloudflare Workers & Next.js runtime.
 * All runtime variables are safely loaded from code to prevent loss during Cloudflare rebuilds.
 */
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",

  // S3 / Cloudflare R2 Settings
  S3_ENDPOINT: process.env.S3_ENDPOINT || "",
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "email-app-attachments",
  S3_REGION: process.env.S3_REGION || "auto",
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID || "",
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY || "",
  S3_PUBLIC_URL: process.env.S3_PUBLIC_URL || "",

  // Authentication & API Keys
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "default_development_secret_key_12345",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  FASTMAIL_API_TOKEN: process.env.FASTMAIL_API_TOKEN || "",
};

export function getRequiredEnv(key: keyof typeof ENV): string {
  const value = ENV[key];
  if (!value && process.env.NODE_ENV === "production") {
    console.warn(`[Runtime Warning] Environment variable "${key}" is not set.`);
  }
  return value;
}
