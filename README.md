# The Bonnet Platform

A GitHub-ready Next.js starter for rebuilding **The Bonnet** into a premium South African mechanic marketplace.

## What is included

- Marketing homepage with strong marketplace positioning
- Mechanic listing directory
- Mechanic detail pages
- Fair Price Index page
- Workshop acquisition page
- Claim-your-workshop onboarding stub
- Workshop dashboard sample
- Admin trust operations sample
- Mock lead capture API
- Prisma schema for a production database
- Product and architecture docs for the next build phase


## Supabase database integration

This repo now includes a full Supabase-ready database layer:

- `prisma/schema.prisma` for Prisma models
- `lib/db.ts` for pooled Prisma runtime access
- `supabase/schema.sql` for a full SQL bootstrap
- `supabase/migrations/202605090001_init_the_bonnet.sql` for CLI deployment
- `supabase/seed.sql` for reference data
- `docs/supabase-setup.md` for step-by-step setup

Quick start:

```bash
cp .env.example .env.local
npm install
npx prisma generate
npm run dev
```

Then follow `docs/supabase-setup.md` to provision Supabase and apply the SQL.

## Suggested stack

- **Frontend:** Next.js App Router + Tailwind CSS + TypeScript
- **Backend:** Next.js route handlers today, easy migration to dedicated services later
- **Database:** PostgreSQL with Prisma
- **Auth:** Clerk, Auth.js, or Supabase Auth
- **Payments:** Stripe or Paystack
- **Storage:** S3 / Cloudflare R2 / Supabase Storage
- **Messaging:** WhatsApp Business API, Twilio, or local provider
- **Maps:** Google Maps or Mapbox

## Local setup

```bash
npm install
cp .env.example .env.local
npm run build
npm run dev
```

Then open `http://localhost:3000`.

## Deployment

### Vercel

1. Push this repo to GitHub.
2. Import it into Vercel.
3. Add environment variables from `.env.example`.
4. Connect your Postgres database.

### Database

This starter includes a `prisma/schema.prisma` file. Typical next steps:

```bash
npm install prisma @prisma/client
npx prisma generate
npx prisma migrate dev --name init
```

## Suggested implementation roadmap

### Phase 1

- Replace seed data with database models
- Add auth and workshop claim flow
- Add media upload and proof verification
- Add lead routing logic
- Add pricing benchmark ingestion

### Phase 2

- Add city pages and service SEO pages
- Add paid subscriptions and billing
- Add ranking algorithm and featured placements
- Add review verification and moderation

### Phase 3

- Add parts commerce
- Add fleet accounts
- Add roadside assistance
- Add inspection products

## Repo structure

```text
app/
components/
lib/
prisma/
docs/
```

## Important note

This is a high-quality starter and strategy-aligned build, not a fully integrated production marketplace. The UI, information architecture, and database schema are designed so your dev team can move directly into implementation.
