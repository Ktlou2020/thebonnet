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
