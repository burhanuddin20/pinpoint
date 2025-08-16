import { cache } from './cache';
import { fetchJson } from './http';
import { createHash } from 'crypto';
import { hasInstagramOEmbed, socialEnv } from './env.social';

export type Embed = { platform: 'tiktok' | 'instagram'; url: string; html?: string; thumbnail?: string; author?: string; title?: string; postedAt?: string };

function sha1(input: string): string {
	return createHash('sha1').update(input).digest('hex');
}

export async function getEmbed(url: string): Promise<Embed> {
	const isTikTok = /tiktok\.com/.test(url);
	const isInstagram = /instagram\.com/.test(url);
	const platform: 'tiktok' | 'instagram' = isTikTok ? 'tiktok' : 'instagram';

	const cacheKey = `oembed:${sha1(url)}`;
	const cached = cache.get<Embed>(cacheKey);
	if (cached) return cached;

	try {
		if (platform === 'tiktok') {
			const data = await fetchJson<any>(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, { method: 'GET', timeoutMs: 1500 });
			const embed: Embed = {
				platform: 'tiktok',
				url,
				author: data?.author_name,
				thumbnail: data?.thumbnail_url,
				title: data?.title,
				html: data?.html,
			};
			cache.set(cacheKey, embed, 7 * 24 * 60 * 60 * 1000);
			return embed;
		}

		// Instagram
		if (hasInstagramOEmbed()) {
			const accessToken = `${socialEnv.IG_APP_ID}|${socialEnv.IG_APP_TOKEN}`;
			const data = await fetchJson<any>(`https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=${encodeURIComponent(accessToken)}`, { method: 'GET', timeoutMs: 1500 });
			const embed: Embed = {
				platform: 'instagram',
				url,
				author: data?.author_name,
				thumbnail: data?.thumbnail_url,
				title: data?.title,
				html: data?.html,
			};
			cache.set(cacheKey, embed, 7 * 24 * 60 * 60 * 1000);
			return embed;
		}
		return { platform: 'instagram', url };
	} catch {
		return { platform, url };
	}
}