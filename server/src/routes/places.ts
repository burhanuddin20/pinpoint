import { Router } from 'express';
import { cache } from '../cache';
import { getDetails, mapPlaceDetails, mapPlaceSummary, searchNearby, searchText } from '../google';

const TEN_MIN_MS = 10 * 60 * 1000;
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export const placesRouter = Router();

placesRouter.get('/nearby', async (req, res) => {
	try {
		const lat = parseFloat(String(req.query.lat));
		const lon = parseFloat(String(req.query.lon));
		const type = String(req.query.type || 'cafe');
		const radius = parseInt(String(req.query.radius || '1500'), 10);
		const max = Math.min(parseInt(String(req.query.max || '20'), 10), 20);

		if (Number.isNaN(lat) || Number.isNaN(lon)) {
			return res.status(400).json({ error: 'lat and lon are required' });
		}

		const cacheKey = `nearby:${type}:${lat}:${lon}:${radius}:${max}`;
		const cached = cache.get<any>(cacheKey);
		if (cached) return res.json(cached);

		const body = {
			includedTypes: [type],
			maxResultCount: max,
			locationRestriction: { circle: { center: { latitude: lat, longitude: lon }, radius } },
		};
		const data = await searchNearby(body);
		const results = (data.places ?? []).map(mapPlaceSummary);
		cache.set(cacheKey, results, TEN_MIN_MS);
		res.json(results);
	} catch (err: any) {
		res.status(500).json({ error: err?.message || 'nearby failed' });
	}
});

placesRouter.get('/text', async (req, res) => {
	try {
		const query = String(req.query.query || '');
		const lat = req.query.lat ? parseFloat(String(req.query.lat)) : undefined;
		const lon = req.query.lon ? parseFloat(String(req.query.lon)) : undefined;
		const radius = req.query.radius ? parseInt(String(req.query.radius), 10) : 1500;
		const max = Math.min(parseInt(String(req.query.max || '20'), 10), 20);

		if (!query) return res.status(400).json({ error: 'query is required' });

		const cacheKey = `text:${query}:${lat ?? ''}:${lon ?? ''}:${radius}:${max}`;
		const cached = cache.get<any>(cacheKey);
		if (cached) return res.json(cached);

		const body: any = { textQuery: query, maxResultCount: max };
		if (lat != null && lon != null) {
			body.locationBias = { circle: { center: { latitude: lat, longitude: lon }, radius } };
		}
		const data = await searchText(body);
		const results = (data.places ?? []).map(mapPlaceSummary);
		cache.set(cacheKey, results, TEN_MIN_MS);
		res.json(results);
	} catch (err: any) {
		res.status(500).json({ error: err?.message || 'text search failed' });
	}
});

placesRouter.get('/details', async (req, res) => {
	try {
		const id = String(req.query.id || '');
		if (!id) return res.status(400).json({ error: 'id is required (e.g., places/XXXX)' });
		const cacheKey = `details:${id}`;
		const cached = cache.get<any>(cacheKey);
		if (cached) return res.json(cached);
		const data = await getDetails(id);
		const mapped = mapPlaceDetails(data);
		cache.set(cacheKey, mapped, SIX_HOURS_MS);
		res.json(mapped);
	} catch (err: any) {
		res.status(500).json({ error: err?.message || 'details failed' });
	}
});