# Railway PostgreSQL setup guide

This project is now optimized to go live quickly with Railway PostgreSQL and Prisma.

## 1. Create the database service in Railway

1. Open your Railway project.
2. Click **New**.
3. Add a **PostgreSQL** service.
4. Wait for Railway to finish provisioning the database.

Railway will automatically create a `DATABASE_URL` for the Postgres service. This app now only requires `DATABASE_URL` on Railway.

## 2. Wire the web app to the database

In your **web app service** on Railway, open **Variables** and add these values:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXT_PUBLIC_SITE_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
```

If your database service is not named `Postgres`, replace `Postgres` with the exact Railway service name.

## 3. Local environment variables

Create `.env.local` from `.env.example`.

```env
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/thebonnet"
```

For local development, point `DATABASE_URL` at your local PostgreSQL instance.

## 4. Deploy the schema with Prisma migrations

This repo now includes an initial Prisma migration in `prisma/migrations`. After Railway connects your web service to PostgreSQL, set the Railway **Pre-deploy Command** to:

```bash
npx prisma migrate deploy && npm run seed:real-data
```

For local development, you can still use:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

## 5. Run the application

```bash
npm run dev
```

Useful endpoints:

- `GET /api/health`
- `POST /api/leads`

When `DATABASE_URL` is configured correctly, new quote requests are written to the `leads` table and the launch workshop dataset can be seeded into Postgres.

## 6. Recommended launch path

1. Launch with Railway PostgreSQL first.
2. Keep Prisma as the only database access layer.
3. Add authentication and file storage later if needed.
4. Add payments only after the lead pipeline is stable.

## 7. Notes

- This repo does **not** require Supabase to go live.
- Railway PostgreSQL is the fastest path for the current stack because the app and database can live in the same project.
- - Railway recommends generating a public domain in **Settings → Networking → Public Networking**.
