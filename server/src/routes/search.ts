import { Router } from 'express';
import { cache } from '../cache';
import { getDetails, mapPlaceDetails, mapPlaceSummary, searchNearby, searchText } from '../google';

const TEN_MIN_MS = 10 * 60 * 1000;

export const searchRouter = Router();

searchRouter.post('/', async (req, res) => {
	try {
		const { query, lat, lon } = req.body ?? {};
		if (typeof query !== 'string' || typeof lat !== 'number' || typeof lon !== 'number') {
			return res.status(400).json({ error: 'Body must include { query: string, lat: number, lon: number }' });
		}

		const normalized = query.toLowerCase();
		const preferNearby = /\b(coffee|cafe|café)\b/.test(normalized);
		const max = 12;
		const cacheKey = `search:${normalized}:${lat}:${lon}`;
		const cached = cache.get<any[]>(cacheKey);
		if (cached) return res.json(cached);

		let results: any[] = [];
		if (preferNearby) {
			const data = await searchNearby({
				includedTypes: ['cafe'],
				maxResultCount: max,
				locationRestriction: { circle: { center: { latitude: lat, longitude: lon }, radius: 1500 } },
			});
			results = (data.places ?? []).map(mapPlaceSummary);
		} else {
			const data = await searchText({ textQuery: query, maxResultCount: max, locationBias: { circle: { center: { latitude: lat, longitude: lon }, radius: 1500 } } });
			results = (data.places ?? []).map(mapPlaceSummary);
		}

		// Enrich top ~8 with details (phone, website, opening)
		const topCount = Math.min(8, results.length);
		const enriched = await Promise.all(
			results.slice(0, topCount).map(async (r) => {
				try {
					const d = await getDetails(r.id);
					const mapped = mapPlaceDetails(d);
					return { ...r, phone: mapped.phone, website: mapped.website, openNow: mapped.openingHours?.openNow };
				} catch (e) {
					return r; // partial failure tolerated
				}
			})
		);
		const final = [...enriched, ...results.slice(topCount)];
		cache.set(cacheKey, final, TEN_MIN_MS);
		res.json(final);
	} catch (err: any) {
		res.status(500).json({ error: err?.message || 'search failed' });
	}
});