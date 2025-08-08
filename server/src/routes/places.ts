import express from 'express';
import { nearbySearch, placeDetails, type NearbyPlace } from '../google';
import { haversineDistanceMeters } from '../util';

const router = express.Router();

router.get('/nearby', async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    const type = (req.query.type as string) || 'cafe';
    const radius = req.query.radius ? Math.min(Number(req.query.radius), 50000) : 1500;
    const query = (req.query.query as string) || undefined;

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: 'lat and lon are required and must be numbers' });
    }

    const key = process.env.GOOGLE_PLACES_KEY;
    if (!key) {
      return res.status(500).json({ error: 'Server misconfiguration: GOOGLE_PLACES_KEY not set' });
    }

    const nearby = await nearbySearch({ apiKey: key, lat, lon, radius, type, keyword: query });

    // Limit results to ~10 for UX/perf
    const top = nearby.results.slice(0, 10);

    const enriched = await Promise.allSettled(
      top.map(async (p: NearbyPlace) => {
        const details = await placeDetails({ apiKey: key, placeId: p.place_id });
        const location = p.geometry.location;
        const distance_m = haversineDistanceMeters(lat, lon, location.lat, location.lng);
        const open_now = details.opening_hours?.open_now ?? p.opening_hours?.open_now;
        const address = details.formatted_address ?? p.vicinity;
        return {
          id: p.place_id,
          name: p.name,
          lat: location.lat,
          lon: location.lng,
          rating: p.rating,
          user_ratings_total: p.user_ratings_total,
          address,
          phone: details.formatted_phone_number ?? details.international_phone_number,
          website: details.website,
          open_now,
          distance_m,
        };
      })
    );

    const response = enriched
      .map((r, idx) => (r.status === 'fulfilled' ? r.value : {
        id: top[idx].place_id,
        name: top[idx].name,
        lat: top[idx].geometry.location.lat,
        lon: top[idx].geometry.location.lng,
        rating: top[idx].rating,
        user_ratings_total: top[idx].user_ratings_total,
        address: top[idx].vicinity,
        open_now: top[idx].opening_hours?.open_now,
        distance_m: haversineDistanceMeters(lat, lon, top[idx].geometry.location.lat, top[idx].geometry.location.lng),
      }))
      .filter(Boolean);

    res.json(response);
  } catch (err: any) {
    console.error('Error in /places/nearby:', err);
    res.status(502).json({ error: 'Upstream error' });
  }
});

export default router;