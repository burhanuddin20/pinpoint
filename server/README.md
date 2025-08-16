# Places Proxy Server (TypeScript)

A minimal Express server that proxies Google Places API (New v1) with strict field masks to control cost.

## Endpoints

- GET `/health` -> `{ ok: true }`
- GET `/places/nearby?lat=..&lon=..&type=cafe&radius=1500&max=20`
- GET `/places/text?query=...&lat=..&lon=..&radius=1500&max=20`
- GET `/places/details?id=places/XXXX`
- POST `/search` with JSON `{ query: string, lat: number, lon: number }`

## Setup

1. Copy `.env.example` to `.env` and set:

```
PORT=3001
GOOGLE_PLACES_KEY=your_google_places_key

# Social search provider (one of: bing | serpapi)
SEARCH_PROVIDER=bing

# If using Bing Web Search v7
BING_KEY=your_bing_search_key

# If using SerpAPI
SERPAPI_KEY=your_serpapi_key

# Optional: Instagram oEmbed (recommended for thumbnails)
IG_APP_ID=your_facebook_app_id
IG_APP_TOKEN=your_facebook_app_token
```

2. Install and run:

```
npm i
npm run dev
```

Server will start at `http://localhost:3001`.

## Security

- Restrict `GOOGLE_PLACES_KEY` in Google Cloud Console:
  - API restrictions: Places API only
  - Application restrictions: Lock to server IP(s) or allowed HTTP referrers/hosts

## Notes

- Uses Places API New v1: POST for nearby/text; GET for details
- Always sends `X-Goog-Api-Key` and `X-Goog-FieldMask` headers
- Basic field masks for search and details to keep responses small and costs low
- In-memory TTL cache reduces upstream calls
- Social enrichment uses only public URLs from web search and official oEmbed endpoints (no HTML scraping). If Instagram oEmbed creds are not provided, Instagram items will omit thumbnails, and TikTok still works.