import { cache } from './cache';
import { findSocialUrlsForPlace, normalizePlaceKey, isTikTokPostUrl } from './socialFinder';
import { getEmbed, type Embed } from './oembed';

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getSocialForPlace({ name, city, neighborhood, limit = 6 }: { name: string; city?: string; neighborhood?: string; limit?: number }): Promise<Embed[]> {
	const key = `social:${normalizePlaceKey(name, city)}`;
	const cached = cache.get<Embed[]>(key);
	if (cached) return cached;

	try {
		const urls = await findSocialUrlsForPlace({ name, city, neighborhood, limit });
		const embedPromises = urls.map((u) => getEmbed(u));
		const settled = await Promise.allSettled(embedPromises);
		const embeds: Embed[] = settled
			.filter((s): s is PromiseFulfilledResult<Embed> => s.status === 'fulfilled')
			.map((s) => s.value);

		// Rank: 1) platform tiktok > instagram, 2) has thumbnail first
		embeds.sort((a, b) => {
			const platformScore = (x: Embed) => (x.platform === 'tiktok' ? 1 : 0);
			const thumbScore = (x: Embed) => (x.thumbnail ? 1 : 0);
			const pa = platformScore(a) - platformScore(b);
			if (pa !== 0) return -pa;
			const tb = thumbScore(a) - thumbScore(b);
			if (tb !== 0) return -tb;
			return 0;
		});

		const top = embeds.slice(0, 3);
		cache.set(key, top, DAY_MS);
		return top;
	} catch {
		return [];
	}
}