import { Router } from 'express';
import { cache } from '../cache';
import { getDetails, mapPlaceDetails, mapPlaceSummary, searchNearby, searchText } from '../google';
import { getSocialForPlace } from '../getSocialForPlace';
import { computeBuzzScore } from '../buzz';

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
		let final: any[] = [...enriched, ...results.slice(topCount)];

		// Social enrichment for top 8 with timeouts and graceful failures
		const socialTop = Math.min(8, final.length);
		const withSocial = await Promise.all(
			final.slice(0, socialTop).map(async (poi) => {
				const controller = new AbortController();
				const timer = setTimeout(() => controller.abort(), 2500);
				try {
					const city = (() => {
						if (!poi.formattedAddress) return undefined;
						const parts = String(poi.formattedAddress).split(',').map((s: string) => s.trim());
						return parts.length >= 2 ? parts[parts.length - 2] : parts[parts.length - 1];
					})();
					// Run social fetch with a guard timeout using Promise.race
					const socialPromise = getSocialForPlace({ name: poi.name, city, limit: 6 });
					const social = await Promise.race([
						socialPromise,
						new Promise<ReturnType<typeof getSocialForPlace>>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
					]).catch(() => [] as any[]);
					const recentCount = Array.isArray(social) ? social.length : 0;
					const totalCount = recentCount;
					const buzzScore = computeBuzzScore({ recentCount, totalCount, rating: poi.rating });
					clearTimeout(timer);
					return { ...poi, social: (social as any[]).slice(0, 3).map((e: any) => ({ platform: e.platform, url: e.url, thumbnail: e.thumbnail, author: e.author })), buzzScore };
				} catch {
					clearTimeout(timer);
					return { ...poi, social: [], buzzScore: 0 };
				}
			})
		);
		final = [...withSocial, ...final.slice(socialTop)];

		// Sort by buzzScore desc, then rating desc
		final.sort((a, b) => {
			const ab = (typeof a.buzzScore === 'number') ? a.buzzScore : 0;
			const bb = (typeof b.buzzScore === 'number') ? b.buzzScore : 0;
			if (bb !== ab) return bb - ab;
			const ar = (typeof a.rating === 'number') ? a.rating : 0;
			const br = (typeof b.rating === 'number') ? b.rating : 0;
			return br - ar;
		});

		cache.set(cacheKey, final, TEN_MIN_MS);
		res.json(final);
	} catch (err: any) {
		res.status(500).json({ error: err?.message || 'search failed' });
	}
});