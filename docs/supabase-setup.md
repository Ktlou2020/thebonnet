# Supabase setup guide

This project is now wired for a real Supabase Postgres database using Prisma for server-side queries and optional Supabase JS clients for future auth/storage flows.

## 1. Create a Supabase project

1. Create a project in the Supabase dashboard.
2. Wait for the database to finish provisioning.
3. Open **Project Settings → Database** and **Project Settings → API**.

## 2. Create a dedicated Prisma database role

Supabase recommends using a custom Prisma database user with privileges on the `public` schema, rather than using your main `postgres` login for application tooling.

1. Open the SQL Editor.
2. Run `supabase/sql/00_create_prisma_role.sql`.
3. Replace `CHANGE_ME_SUPABASE_PASSWORD` with a strong password before running it.

## 3. Copy environment variables

Populate `.env.local` from `.env.example`.

### Required values
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`

### Recommended connection strings

#### If deploying to Vercel / serverless
Use a pooled connection string for `DATABASE_URL`:

```env
DATABASE_URL="postgresql://prisma.YOUR-PROJECT-REF:YOUR-PRISMA-PASSWORD@aws-0-YOUR-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

Use a direct connection string for Prisma CLI and migrations:

```env
DIRECT_URL="postgresql://postgres:YOUR-POSTGRES-PASSWORD@db.YOUR-PROJECT-REF.supabase.co:5432/postgres"
```

#### If deploying to a long-lived Node server
You can use the session pooler for `DATABASE_URL` instead of the transaction pooler.

## 4. Install dependencies

```bash
npm install
```

The repo will automatically generate Prisma Client on install.

## 5. Apply schema to Supabase

You have two safe options.

### Option A — Supabase SQL Editor
Run `supabase/schema.sql` in the SQL editor, then run `supabase/seed.sql`.

### Option B — Supabase CLI migrations

```bash
npm install -g supabase
supabase login
supabase link
supabase db push
supabase db push --include-seed
```

The migration file lives in `supabase/migrations/202605090001_init_the_bonnet.sql`.

## 6. Generate Prisma client and test the database

```bash
npx prisma generate
npm run dev
```

Health endpoint:

```text
GET /api/health
```

Lead capture endpoint:

```text
POST /api/leads
```

When `DATABASE_URL` is set correctly, lead submissions are written to the `leads` table.

## 7. Recommended next implementation step

After the schema is live, replace seed data in `lib/data.ts` with real Prisma queries for:
- verified workshops
- fair-price benchmarks
- dashboard lead summaries
- admin moderation queues

## Notes on security

- Row Level Security is enabled on application tables in `supabase/schema.sql`.
- Public read access is intentionally limited to verified marketplace data.
- Quote request inserts are open to `anon` and `authenticated` so the public lead form can work.
- Workshop owner and admin access is enforced through policies and helper functions.
