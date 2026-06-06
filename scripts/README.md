# Scripts

## workshops:import:places

Imports 4-star+ mechanic workshops from Google Places into the database.

### Setup

1. Get a Google Places API key from [Google Cloud Console](https://console.cloud.google.com/) — enable the **Places API** for your project.
2. Add the key to your `.env` file:
   ```
   GOOGLE_PLACES_API_KEY="your-google-places-api-key"
   ```
3. Ensure `DATABASE_URL` is also set in `.env`.

### Usage

```bash
npm run workshops:import:places
```

The script searches 10 South African cities (Cape Town, Johannesburg, Pretoria, Durban, Port Elizabeth, Bloemfontein, Nelspruit, Polokwane, East London, Sandton) using three query types per city, filters results to 4+ stars with at least 10 reviews, fetches full place details, and upserts each workshop into the database with status `VERIFIED`.

### Admin UI

Admins can also trigger a single-city import from the workshop admin panel at `/admin/workshops` using the "Import from Google Places" form — no SSH required.

---

## workshops:scrape

Scrapes mechanic workshop data from multiple South African public business directories and imports it into the database. **No API key required.**

### Sources

| Source | URL pattern |
|---|---|
| yellowpages.co.za | `/search?q=mechanic+workshop&l={city}` |
| brabys.com | `/search/?q=mechanic&city={city}` |
| businesslist.co.za | `/category/automotive/mechanics/{city-slug}` |
| cylex.co.za | `/south-africa/{city}/car+repair.html` |
| hotfrog.co.za | `/search/za/{city}/auto-repair` |

### Setup

Only `DATABASE_URL` in `.env` is required — no third-party API keys needed.

### Usage

```bash
npm run workshops:scrape
```

Scrapes 15 South African cities, deduplicates results by business name per city, and upserts each workshop with `status: PENDING` so it can be reviewed before going live. Phone numbers are normalised to `+27 XX XXX XXXX` format.

### Via Admin API

POST `/api/admin/import-workshops` with body `{ "source": "scraper", "city": "Cape Town" }` to trigger a single-city scraper import from the admin panel.
