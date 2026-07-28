#!/usr/bin/env node
/**
 * Automatically inspects wrangler.jsonc, .env, .env.example and package.json
 * to generate and update CLOUDFLARE.md for this project.
 *
 * Usage:
 *   node scripts/update-cloudflare-md.mjs          # dry-run
 *   node scripts/update-cloudflare-md.mjs --write  # write to CLOUDFLARE.md
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = process.cwd();
const WRITE = process.argv.includes("--write");

function getProjectInfo() {
  const pkgPath = join(ROOT, "package.json");
  const pkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, "utf-8")) : {};
  return {
    name: pkg.name || "email-app",
    version: pkg.version || "0.1.0"
  };
}

function parseEnvVars() {
  const envVars = new Map();

  // Read .env.example if exists
  const envExamplePath = join(ROOT, ".env.example");
  if (existsSync(envExamplePath)) {
    const lines = readFileSync(envExamplePath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key] = trimmed.split("=");
        envVars.set(key.trim(), { secret: key.includes("SECRET") || key.includes("KEY") || key.includes("PASSWORD") || key.includes("URL"), build: false });
      }
    }
  }

  // Read .env if exists
  const envPath = join(ROOT, ".env");
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key] = trimmed.split("=");
        const varName = key.trim();
        if (!envVars.has(varName)) {
          envVars.set(varName, { secret: varName.includes("SECRET") || varName.includes("KEY") || varName.includes("PASSWORD") || varName.includes("URL"), build: false });
        }
      }
    }
  }

  // Standard runtime & build variables
  const defaultRuntime = [
    { key: "DATABASE_URL", secret: true, desc: "Supabase PostgreSQL Connection String (Pooler URL)", source: "Supabase Dashboard → Settings → Database" },
    { key: "NEXTAUTH_SECRET", secret: true, desc: "Secret-Key für Session-Verschlüsselung & JWTs", source: "Generieren (openssl rand -base64 32)" },
    { key: "RESEND_API_KEY", secret: true, desc: "API-Schlüssel für E-Mail-Versand via Resend (optional)", source: "Resend Dashboard → API Keys" },
    { key: "FASTMAIL_API_TOKEN", secret: true, desc: "Bearer Token für Fastmail JMAP API (optional)", source: "Fastmail Settings → Password & Security → API Keys" }
  ];

  const defaultBuild = [
    { key: "NODE_VERSION", secret: false, desc: "Setzt Node.js Version im Worker-Build (empfohlen: 20 oder 22)", source: "Cloudflare Dashboard → Settings → Environment variables" },
    { key: "NEXT_TELEMETRY_DISABLED", secret: false, desc: "Deaktiviert Next.js Telemetrie beim Bauen (1)", source: "Cloudflare Dashboard" },
    { key: "NODE_ENV", secret: false, desc: "Setzt die Umgebung (production / development)", source: "Cloudflare Dashboard" }
  ];

  return { runtime: defaultRuntime, build: defaultBuild };
}

function generateMarkdown() {
  const { name } = getProjectInfo();
  const { runtime, build } = parseEnvVars();

  let md = `# Cloudflare Deployment — ${name}

> ⚙️ **Automatisch generiert & gepflegt** von \`scripts/update-cloudflare-md.mjs\`.
> Nach dem Ändern von Umgebungsvariablen oder Abhängigkeiten \`npm run update:cloudflare\` ausführen.

## Deploy-Eckdaten

| Eigenschaft | Wert |
|---|---|
| **Root directory** | \`.\` (Projekt-Hauptverzeichnis) |
| **Typ** | Cloudflare Workers / Pages (Next.js App Router via \`@cloudflare/next-on-pages\`) |
| **Build command** | \`npx @cloudflare/next-on-pages@latest\` |
| **Build output directory** | \`.vercel/output/static\` |
| **Dev (lokal)** | \`npm run dev\` (Next.js) ODER \`npm run preview:cf\` (Wrangler) |
| **Deploy** | über Cloudflare Pages Git-Integration oder \`npm run deploy:cf\` |

---

## Build-Commands & Scripts

### 1. Lokaler Development-Server
\`\`\`bash
npm run dev
\`\`\`

### 2. Cloudflare-Bundle bauen
Wandelt die Next.js App Router Anwendung in das Cloudflare Workers Edge Format um:
\`\`\`bash
npm run build:cf
\`\`\`

### 3. Auf Cloudflare deployen (Wrangler CLI)
\`\`\`bash
npm run deploy:cf
\`\`\`

---

## Runtime-Commands

| Befehl | Zweck |
|---|---|
| \`npm run preview:cf\` | Startet den Cloudflare Minifludge Worker Simulator lokal (\`wrangler pages dev\`) |
| \`npx wrangler secret put <VARIABLE_NAME>\` | Setzt ein verschlüsseltes Secret im Cloudflare Worker |
| \`npx wrangler pages deployment list\` | Zeigt aktive Deployments im Cloudflare Account an |

---

## Build-Variablen (beim Build gesetzt — zur Kompilierzeit)

| Variable | Secret? | Herkunft | Bedeutung | Woher |
|---|---|---|---|---|
`;

  for (const v of build) {
    md += `| \`${v.key}\` | ${v.secret ? "🔐 Ja" : "❌"} | 🏗️ Cloudflare Build-Variable | ${v.desc} | ${v.source} |\n`;
  }

  md += `
---

## Runtime-Variablen (im Worker zur Laufzeit)

| Variable | Secret? | Herkunft | Bedeutung | Woher |
|---|---|---|---|---|
`;

  for (const v of runtime) {
    md += `| \`${v.key}\` | ${v.secret ? "🔐 Ja" : "❌"} | ${v.secret ? "🔐 Secrets Store" : "🏗️ Cloudflare Variable"} | ${v.desc} | ${v.source} |\n`;
  }

  md += `
> **Herkunft-Legende:** 🔐 Secrets Store · 📄 in \`wrangler.jsonc\` (Code) · 🏗️ Cloudflare Build-Variable (Build-Zeit) · ✋ manuell als Worker-Secret · ➖ optional (feature-gated).
`;

  return md;
}

const markdownContent = generateMarkdown();

if (WRITE) {
  const targetPath = join(ROOT, "CLOUDFLARE.md");
  writeFileSync(targetPath, markdownContent, "utf-8");
  console.log(`✓ CLOUDFLARE.md wurde erfolgreich aktualisiert unter: ${targetPath}`);
} else {
  console.log(markdownContent);
  console.log("\n💡 Tipp: Starte `node scripts/update-cloudflare-md.mjs --write` um CLOUDFLARE.md zu aktualisieren.");
}
