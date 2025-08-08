# Pinpoint Server (Minimal Google Places Proxy)

## Setup

1. Create a `.env` file in this folder with your Google API key:

```
GOOGLE_PLACES_KEY=YOUR_GOOGLE_API_KEY
PORT=4000
```

2. Install dependencies and start the dev server:

```
npm install
npm run dev
```

Build and run:

```
npm run build
npm start
```

The server runs at `http://localhost:4000`.

## Endpoint

GET `/places/nearby`

Query params:
- `lat` (required)
- `lon` (required)
- `type` (default `cafe`)
- `radius` (default `1500`)
- `query` (optional)

Response: JSON array of places with details and `distance_m`.

This service enforces a simple rate limit of 60 req/min per IP, enables CORS for local dev, and uses short timeouts for upstream requests. Errors from Place Details are handled gracefully and do not fail the entire response.