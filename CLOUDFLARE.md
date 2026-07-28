# Cloudflare Deployment — email-app

> ⚙️ **Automatisch generiert & gepflegt** von `scripts/update-cloudflare-md.mjs`.
> Nach dem Ändern von Umgebungsvariablen oder Abhängigkeiten `npm run update:cloudflare` ausführen.

## Deploy-Eckdaten

| Eigenschaft | Wert |
|---|---|
| **Root directory** | `.` (Projekt-Hauptverzeichnis) |
| **Typ** | Cloudflare Workers / Pages (Next.js App Router via `@cloudflare/next-on-pages`) |
| **Build command** | `npx @cloudflare/next-on-pages@latest` |
| **Build output directory** | `.vercel/output/static` |
| **Dev (lokal)** | `npm run dev` (Next.js) ODER `npm run preview:cf` (Wrangler) |
| **Deploy** | über Cloudflare Pages Git-Integration oder `npm run deploy:cf` |

---

## Build-Commands & Scripts

### 1. Lokaler Development-Server
```bash
npm run dev
```

### 2. Cloudflare-Bundle bauen
Wandelt die Next.js App Router Anwendung in das Cloudflare Workers Edge Format um:
```bash
npm run build:cf
```

### 3. Auf Cloudflare deployen (Wrangler CLI)
```bash
npm run deploy:cf
```

---

## Runtime-Commands

| Befehl | Zweck |
|---|---|
| `npm run preview:cf` | Startet den Cloudflare Minifludge Worker Simulator lokal (`wrangler pages dev`) |
| `npx wrangler secret put <VARIABLE_NAME>` | Setzt ein verschlüsseltes Secret im Cloudflare Worker |
| `npx wrangler pages deployment list` | Zeigt aktive Deployments im Cloudflare Account an |

---

## Build-Variablen (beim Build gesetzt — zur Kompilierzeit)

| Variable | Secret? | Herkunft | Bedeutung | Woher |
|---|---|---|---|---|
| `NODE_VERSION` | ❌ | 🏗️ Cloudflare Build-Variable | Setzt Node.js Version im Worker-Build (empfohlen: 20 oder 22) | Cloudflare Dashboard → Settings → Environment variables |
| `NEXT_TELEMETRY_DISABLED` | ❌ | 🏗️ Cloudflare Build-Variable | Deaktiviert Next.js Telemetrie beim Bauen (1) | Cloudflare Dashboard |
| `NODE_ENV` | ❌ | 🏗️ Cloudflare Build-Variable | Setzt die Umgebung (production / development) | Cloudflare Dashboard |

---

## Runtime-Variablen (im Worker zur Laufzeit)

| Variable | Secret? | Herkunft | Bedeutung | Woher |
|---|---|---|---|---|
| `DATABASE_URL` | 🔐 Ja | 🔐 Secrets Store | Supabase PostgreSQL Connection String (Pooler URL) | Supabase Dashboard → Settings → Database |
| `NEXTAUTH_SECRET` | 🔐 Ja | 🔐 Secrets Store | Secret-Key für Session-Verschlüsselung & JWTs | Generieren (openssl rand -base64 32) |
| `RESEND_API_KEY` | 🔐 Ja | 🔐 Secrets Store | API-Schlüssel für E-Mail-Versand via Resend (optional) | Resend Dashboard → API Keys |
| `FASTMAIL_API_TOKEN` | 🔐 Ja | 🔐 Secrets Store | Bearer Token für Fastmail JMAP API (optional) | Fastmail Settings → Password & Security → API Keys |

> **Herkunft-Legende:** 🔐 Secrets Store · 📄 in `wrangler.jsonc` (Code) · 🏗️ Cloudflare Build-Variable (Build-Zeit) · ✋ manuell als Worker-Secret · ➖ optional (feature-gated).
