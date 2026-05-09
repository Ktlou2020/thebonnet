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

## Railway PostgreSQL database integration

This repo is now optimized for **Railway PostgreSQL + Prisma** so you can get the platform live quickly without a separate database provider.

Included in the repo:

- `prisma/schema.prisma` for the full application data model
- `lib/db.ts` for Prisma runtime access
- `docs/railway-postgres-setup.md` for step-by-step Railway setup
- `app/api/health/route.ts` for database connectivity checks
- `app/api/leads/route.ts` for writing leads into Postgres

Quick start:

```bash
cp .env.example .env.local
npm install
npx prisma generate
npm run dev
```

Production on Railway uses a standalone Next.js build and Prisma migrations.

Then follow `docs/railway-postgres-setup.md` to provision Railway PostgreSQL and connect the app.

## Suggested stack

- **Frontend:** Next.js App Router + Tailwind CSS + TypeScript
- **Backend:** Next.js route handlers today, easy migration to dedicated services later
- **Database:** Railway PostgreSQL with Prisma
- **Auth:** Clerk or Auth.js
- **Payments:** Stripe or Paystack
- **Storage:** S3 or Cloudflare R2
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

### Railway

1. Push this repo to GitHub.
2. Deploy the web service on Railway.
3. Add a PostgreSQL service in the same Railway project.
4. Add environment variables from `.env.example`.
5. In the web service set **Pre-deploy Command** to `npx prisma migrate deploy`.
6. Generate a public domain in Railway Networking.

### Database

This starter includes a `prisma/schema.prisma` file. Typical next steps:

```bash
npx prisma generate
npx prisma db push
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
