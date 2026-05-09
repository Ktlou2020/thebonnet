# Railway PostgreSQL setup guide

This project is now optimized to go live quickly with Railway PostgreSQL and Prisma.

## 1. Create the database service in Railway

1. Open your Railway project.
2. Click **New**.
3. Add a **PostgreSQL** service.
4. Wait for Railway to finish provisioning the database.

Railway will automatically create a `DATABASE_URL` for the Postgres service.

## 2. Wire the web app to the database

In your **web app service** on Railway, open **Variables** and add these values:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
DIRECT_URL=${{Postgres.DATABASE_URL}}
NEXT_PUBLIC_SITE_URL=https://YOUR-APP.railway.app
```

If your database service is not named `Postgres`, replace `Postgres` with the exact Railway service name.

## 3. Local environment variables

Create `.env.local` from `.env.example`.

```env
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/thebonnet"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:5432/thebonnet"
```

For local development you can point both values at the same local PostgreSQL instance.

## 4. Push the schema with Prisma

Once `DATABASE_URL` is available, apply the schema:

```bash
npm install
npx prisma generate
npx prisma db push
```

If you later add formal Prisma migrations, deploy them with:

```bash
npx prisma migrate deploy
```

## 5. Run the application

```bash
npm run dev
```

Useful endpoints:

- `GET /api/health`
- `POST /api/leads`

When `DATABASE_URL` is configured correctly, new quote requests are written to the `leads` table.

## 6. Recommended launch path

1. Launch with Railway PostgreSQL first.
2. Keep Prisma as the only database access layer.
3. Add authentication and file storage later if needed.
4. Add payments only after the lead pipeline is stable.

## 7. Notes

- This repo does **not** require Supabase to go live.
- Railway PostgreSQL is the fastest path for the current stack because the app and database can live in the same project.
- `DIRECT_URL` can match `DATABASE_URL` on Railway for this starter.
