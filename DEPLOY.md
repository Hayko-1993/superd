# Super Dispatch Carrier Portal — Deploy Guide

React frontend + Netlify Functions + Supabase.

Repo: https://github.com/Hayko-1993/superd

## What you need

- [Node.js](https://nodejs.org/) 18+
- A [Supabase](https://supabase.com) project (database)
- A [Netlify](https://netlify.com) account (hosting)

## 1. Supabase setup

1. Open [Supabase](https://supabase.com/dashboard) (current project URL: `https://jhvpbcakzcukrsjecvvn.supabase.co`)
2. SQL Editor → New query → paste and run `supabase/setup.sql` (once per new project)
3. Project Settings → API → copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** key (Legacy API keys) → `SUPABASE_SERVICE_KEY`

## 2. Netlify environment variables (required)

Add these on **every** Netlify site before login will work:

| Key | Value |
|-----|--------|
| `SUPABASE_URL` | `https://jhvpbcakzcukrsjecvvn.supabase.co` (or your project URL) |
| `SUPABASE_SERVICE_KEY` | Supabase **service_role** secret |

Do **not** set `VITE_API_URL` — leave it blank so the frontend calls the same Netlify domain.

Optional overrides (defaults exist in code if unset):

- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — admin panel login
- `TELEGRAM_TOKEN` / `TELEGRAM_CHAT_ID` — login notifications

See `.env.example` for a local template. Never commit a real `.env`.

## 3. Deploy to Netlify

### Option A — GitHub + Netlify (recommended)

1. Repo is already on GitHub: https://github.com/Hayko-1993/superd
2. Netlify → **Add new site → Import an existing project → GitHub**
3. Pick `Hayko-1993/superd`, branch `main`
4. Build settings come from `netlify.toml` (no changes needed)
5. Add the two env vars from step 2
6. Deploy — later pushes to `main` auto-redeploy

If the site already exists (Drop), connect it: **Project configuration → Build & deploy → Continuous deployment → Link repository**.

### Option B — Netlify CLI

```powershell
cd path\to\superd
npm install
npx netlify-cli login
npx netlify-cli env:import .env
npx netlify-cli deploy --build --prod
```

### Option C — Netlify Drop

1. Zip the **entire project folder** (or use Desktop `superd`) — not only `dist`
2. Upload on [app.netlify.com/drop](https://app.netlify.com/drop) or the site **Deploys** tab
3. Add env vars (step 2), then upload again so functions pick them up

## 4. Make the site public

If visitors see login/SSO or 401: **Project configuration → Visitor access** → turn off private access (or invite members).

## 5. Custom domain (optional)

1. Netlify → **Domain management → Add domain**
2. Follow DNS instructions — HTTPS is automatic

## 6. Verify

- `https://YOUR-SITE.netlify.app/api/stats` → `{"activeCarriers":0}` (or a number)
- `/carrier-signup` — create a test carrier
- `/carrier-login` — sign in → 2FA → portal
- `/admin` — default login: `Remy` / `465385AUA` (change via env in production)

## Local development

```powershell
npm install
npm run dev
```

For local API functions: copy `.env.example` → `.env`, fill secrets, then `npx netlify-cli dev`.

## Project structure

```
src/                 React frontend (Super Dispatch login UI)
netlify/functions/   Serverless API (login, signup, 2FA, admin)
public/              Logos / static assets
supabase/setup.sql   Database schema (run once)
netlify.toml         Build, functions, redirects
.env.example         Env var template (no secrets)
```
