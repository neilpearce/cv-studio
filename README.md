# CV Studio

A modern, persistent CV editor: live preview, drag-and-drop sections, two clean templates, autosave, dark mode, and PDF export.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn-style primitives (Radix)
- Prisma + Postgres (Neon recommended for free hosting)
- Auth.js v5 (Credentials + optional Google OAuth)
- @dnd-kit for drag-and-drop
- Puppeteer (local dev) + `@sparticuz/chromium` (Vercel) for PDF export
- next-themes for dark mode, sonner for toasts

## MVP scope

What's in: editor with the 5 core sections, 2 templates (Modern + Minimal), autosave, undo/redo, dark mode, dashboard with create/duplicate/rename/delete/search/filter, PDF export, email/password auth, optional Google sign-in.

Deferred (intentionally out of MVP): DOCX export, AI suggestions, ATS keyword check, PDF/DOCX import, real-time collaboration, comments, cover letters, i18n, version history, share links, offline mode.

## Quick start (local dev)

You need a Postgres URL — easiest is a free Neon database (<https://neon.tech>, takes 30 seconds).

```bash
cd cv-studio
# edit .env and paste your Neon DATABASE_URL
npm install                # also downloads Chromium for Puppeteer (~150MB, dev only)
npm run db:push            # creates tables in your Neon DB
npm run db:seed            # seeds the demo account
npm run dev
```

Open <http://localhost:3000>.

**Demo login:** `demo@cvstudio.app` / `password123`

Or click **Get started** to create a new account.

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Var | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string from Neon (or any Postgres) |
| `AUTH_SECRET` | yes | Generate with `openssl rand -base64 32` |
| `AUTH_URL` | prod only | e.g. `https://mycvstudio.co.uk` |
| `AUTH_GOOGLE_ID` | optional | Enables Google sign-in if set |
| `AUTH_GOOGLE_SECRET` | optional | Enables Google sign-in if set |

If Google credentials are not set, only email/password sign-in is available.

## Architecture notes

- CV content is stored as **structured JSON** in `CV.data` so the same record can be re-opened, re-edited, and re-exported indefinitely. Templates are decoupled view layers — switching template never alters content.
- The editor uses a small custom undo/redo reducer (50-step history) and an autosave hook that PATCHes `/api/cvs/[id]` ~800ms after the last change.
- PDF export uses Puppeteer to render `/cv/[id]/print` (the print-only view of the same template) at A4 size. Auth cookies from the request are forwarded to the headless browser so the print page returns the user's data.
- Section order is part of the data shape (`sectionOrder: SectionKey[]`) so reorder state survives reload, duplication, and template switching.

## Project layout

```
src/
  app/
    api/                       # Route handlers
      auth/[...nextauth]/      # NextAuth handler
      cvs/                     # CV CRUD + export
      register/
    cv/[id]/                   # Editor + print view
    dashboard/                 # Dashboard
    (auth)/signin, signup/     # Auth pages
  components/
    editor/                    # Editor + section forms
    templates/                 # Modern + Minimal (decoupled)
    dashboard/                 # Dashboard client
    ui/                        # shadcn-style primitives
  lib/                         # Prisma, auth, types, defaults
  hooks/                       # useUndoRedo, useAutosave
prisma/
  schema.prisma
  seed.ts
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start dev server on :3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed demo user + sample CV |
| `npm run db:studio` | Open Prisma Studio |

## Deployment (Vercel + Neon, with Fasthosts domain)

This project is configured for **Vercel + Neon Postgres** out of the box. PDF export auto-switches between full Puppeteer locally and `@sparticuz/chromium` on Vercel — no code changes needed.

### Step-by-step

**1. Create a Postgres database (Neon, free)**

- Sign up at <https://neon.tech>
- Create a project
- Copy the connection string (looks like `postgresql://user:pw@ep-xxx.eu-west-2.aws.neon.tech/neondb?sslmode=require`)

**2. Push to GitHub**

```bash
cd cv-studio
git init
git add .
git commit -m "Initial commit"
gh repo create mycvstudio --public --source=. --push
# or via UI: github.com/new, then add remote and push
```

**3. Local dev with the Neon DB**

Edit `.env`:

```
DATABASE_URL="<paste your Neon connection string>"
AUTH_SECRET="<run: openssl rand -base64 32>"
```

```bash
npm install
npm run db:push   # creates the tables in Neon
npm run db:seed   # creates demo@cvstudio.app / password123
npm run dev
```

**4. Deploy to Vercel**

- <https://vercel.com> → "Add New… → Project" → import your GitHub repo.
- Set environment variables in the Vercel project settings:
  - `DATABASE_URL` — the same Neon string
  - `AUTH_SECRET` — generate a fresh one for production: `openssl rand -base64 32`
  - `AUTH_URL` — `https://mycvstudio.co.uk` (or whatever final URL you use)
  - `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` (only if using Google sign-in)
- Click Deploy.

**5. Connect your Fasthosts domain (`mycvstudio.co.uk`)**

In Vercel → your project → **Settings → Domains** → add `mycvstudio.co.uk` and `www.mycvstudio.co.uk`. Vercel will show you DNS records to set.

In Fasthosts → **Domains → mycvstudio.co.uk → DNS settings**, set:

| Type | Host / Name | Value | TTL |
|---|---|---|---|
| `A` | `@` (or blank) | `76.76.21.21` | 3600 |
| `CNAME` | `www` | `cname.vercel-dns.com` | 3600 |

DNS propagation usually takes 5–30 minutes. Once Vercel shows ✅ next to both domains, your site is live at <https://mycvstudio.co.uk>.

### Notes

- The `vercel.json` in the repo bumps the PDF route timeout to 60s (Pro plan) — on Hobby plan, Vercel caps at 10–15s, which can be tight for PDF rendering. If exports time out, either upgrade to Pro or move just the export route to a long-running host.
- Vercel's free tier easily covers a personal CV builder.
- `prisma generate` runs automatically on each deploy via the `postinstall` hook.

### Self-host alternative

If you'd rather host on a VPS (DigitalOcean, Hetzner, AWS EC2), let me know and I'll add a `Dockerfile` + nginx config. The Vercel path is simpler for this use case.

## What's not built (deferred)

These were explicitly scoped out of the MVP. Each is a manageable follow-up:

- **DOCX export** — `docx` npm package, render from the same JSON.
- **AI suggestions / ATS check** — wire to Claude API; per-section "improve" actions.
- **Import from PDF/DOCX** — server-side parsing, then map into the JSON shape.
- **Real-time collaboration** — Yjs or Liveblocks, hooked into the same data store.
- **Version history** — add a `CVVersion` table; snapshot on autosave.
- **Share links** — public read-only routes with signed tokens.
- **Cover letters / multi-language / offline** — straightforward add-ons.

Templates are decoupled and version-agnostic, so adding more templates is just adding a file to `src/components/templates/` and registering it in `index.tsx`.
