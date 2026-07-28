# Cloudflare Deployment — email-app

> ⚙️ **Cloudflare Workers / Pages Konfiguration** für den Fastmail-Style E-Mail-Client (`email-app`).

## Deploy-Eckdaten

| Eigenschaft | Wert |
|---|---|
| **Root directory** | `.` (Projekt-Hauptverzeichnis) |
| **Typ** | Cloudflare Workers / Pages (Next.js App Router via `@cloudflare/next-on-pages`) |
| **Build command** | `npx @cloudflare/next-on-pages@latest` |
| **Build output directory** | `.vercel/output/static` |
| **Dev (lokal)** | `npm run dev` (Next.js) ODER `npx wrangler pages dev` |
| **Deploy** | über Cloudflare Pages Git-Integration oder `npx wrangler pages deploy` |

---

## Build-Commands & Scripts

### 1. Lokaler Development-Server
```bash
npm run dev
```

### 2. Cloudflare-Bundle bauen
Wandelt die Next.js App Router Anwendung in das Cloudflare Workers Edge Format um:
```bash
npx @cloudflare/next-on-pages@latest
```

### 3. Auf Cloudflare deployen (Wrangler CLI)
```bash
npx wrangler pages deploy .vercel/output/static --project-name=email-app
```

---

## Runtime-Commands

| Befehl | Zweck |
|---|---|
| `npx wrangler pages dev .vercel/output/static` | Startet den Cloudflare Minifludge Worker Simulator lokal |
| `npx wrangler secret put DATABASE_URL` | Setzt verschlüsselte Secrets für den Cloudflare Worker |
| `npx wrangler pages deployment list` | Zeigt aktive Deployments in Cloudflare an |

---

## Build-Variablen (beim Build gesetzt — zur Kompilierzeit)

| Variable | Secret? | Herkunft | Bedeutung | Woher |
|---|---|---|---|---|
| `NODE_VERSION` | ❌ | 🏗️ Cloudflare Build-Variable | Setzt Node.js Version im Worker-Build (empfohlen: `20` oder `22`) | Cloudflare Dashboard → Settings → Environment variables |
| `NEXT_TELEMETRY_DISABLED` | ❌ | 🏗️ Cloudflare Build-Variable | Deaktiviert Next.js Telemetrie beim Bauen (`1`) | Cloudflare Dashboard |
| `NODE_ENV` | ❌ | 🏗️ Cloudflare Build-Variable | Setzt die Umgebung (`production` / `development`) | Cloudflare Dashboard |

---

## Runtime-Variablen (im Worker zur Laufzeit)

| Variable | Secret? | Herkunft | Bedeutung | Woher |
|---|---|---|---|---|
| `DATABASE_URL` | 🔐 Ja | 🔐 Secrets Store / 🏗️ Cloudflare Variable | Supabase PostgreSQL Connection String (Pooler URL mit Session / Transaction mode) | Supabase Dashboard → Settings → Database |
| `NEXTAUTH_SECRET` | 🔐 Ja | 🔐 Secrets Store | Secret-Key für Session-Verschlüsselung & JWTs | Generieren (`openssl rand -base64 32`) |
| `RESEND_API_KEY` | 🔐 Ja | ✋ manuell als Worker-Secret | API-Schlüssel für E-Mail-Versand via Resend (optional) | Resend Dashboard → API Keys |
| `FASTMAIL_API_TOKEN` | 🔐 Ja | ✋ manuell als Worker-Secret | Bearer Token für Fastmail JMAP API (optional) | Fastmail Settings → Password & Security → API Keys |

> **Herkunft-Legende:** 🔐 Secrets Store · 📄 in `wrangler.jsonc` (Code) · 🏗️ Cloudflare Build-Variable (Build-Zeit) · ✋ manuell als Worker-Secret · ➖ optional (feature-gated).
