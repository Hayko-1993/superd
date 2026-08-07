# Deployment & Environment Setup

This site is a Vite + React app with Netlify Functions (server-side).
It CANNOT be deployed by drag-and-drop ZIP — functions and the build
only run when Netlify builds the site from a linked Git repository
(or via Netlify CLI).

## 1. Deploy method (required)

Push this folder to a GitHub repo, then in Netlify:
Site configuration -> Build & deploy -> Link repository.
netlify.toml already contains the correct build command and settings.

## 2. Environment variables (Netlify -> Site configuration -> Environment variables)

| Key                  | Value                                            | Mark as secret? |
|----------------------|--------------------------------------------------|-----------------|
| SUPABASE_URL         | https://jhvpbcakzcukrsjecvvn.supabase.co         | no              |
| SUPABASE_SERVICE_KEY | sb_secret_...  (Supabase -> Settings -> API Keys)| YES             |
| ADMIN_EMAIL          | your admin login email                           | no              |
| ADMIN_PASSWORD       | your admin login password                        | YES             |
| ADMIN_TOKEN_SECRET   | any long random string (e.g. 40+ chars)          | YES             |
| CARRIER_TOKEN_SECRET | another long random string                       | YES             |
| TELEGRAM_TOKEN       | your Telegram bot token (optional)               | YES             |
| TELEGRAM_CHAT_ID     | your Telegram chat id (optional)                 | no              |

NOTE: this app uses the Supabase SECRET key (service role), because all
database access happens in server-side Netlify Functions. The secret key
never reaches the browser — this is the correct, secure setup.
The "publishable" key is NOT used anywhere in this codebase.

## 3. After setting variables

Trigger a new deploy (Deploys -> Trigger deploy -> Deploy site).
Environment variable changes only take effect after a redeploy.
