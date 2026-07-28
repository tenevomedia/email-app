import type { Metadata } from "next";
import "./globals.css";
import { EmailProvider } from "@/lib/emailContext";

export const metadata: Metadata = {
  title: "Fastmail Client - MailForge",
  description: "Custom Fastmail-like Email Client App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" data-theme="light">
      <body>
        <EmailProvider>
          {children}
        </EmailProvider>
      </body>
    </html>
  );
}
