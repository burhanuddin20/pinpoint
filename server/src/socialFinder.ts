import { fetchJson } from './http';
import { socialEnv, SearchProvider } from './env.social';

export function isTikTokPostUrl(url: string): boolean {
	try {
		const u = new URL(url);
		if (!/\.tiktok\.com$/.test(u.hostname) && u.hostname !== 'www.tiktok.com' && !u.hostname.endsWith('tiktok.com')) return false;
		const path = u.pathname.replace(/\/+$/, '');
		// Matches /@user/video/<id> or /t/<id>
		return /\/@[\w.-]+\/video\/[0-9]+$/.test(path) || /\/t\/[A-Za-z0-9]+$/.test(path);
	} catch {
		return false;
	}
}

export function isInstagramPostUrl(url: string): boolean {
	try {
		const u = new URL(url);
		if (!u.hostname.endsWith('instagram.com')) return false;
		const path = u.pathname.replace(/\/+$/, '');
		// Matches /p/<code> or /reel/<code>
		return /\/p\/[A-Za-z0-9_-]+$/.test(path) || /\/reel\/[A-Za-z0-9_-]+$/.test(path);
	} catch {
		return false;
	}
}

export function normalizePlaceKey(name: string, city?: string): string {
	const slugify = (s: string) => s
		.toLowerCase()
		.replace(/&/g, ' and ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-+/g, '-');
	const nameSlug = slugify(name || '');
	const citySlug = city ? slugify(city) : '';
	return citySlug ? `${nameSlug}--${citySlug}` : nameSlug;
}

type FindArgs = { name: string; city?: string; neighborhood?: string; limit?: number };

export async function findSocialUrlsForPlace({ name, city, neighborhood, limit = 8 }: FindArgs): Promise<string[]> {
	const parts = [name, neighborhood ?? '', city ?? ''].filter(Boolean).join(' ');
	const qTikTok = `${parts} site:tiktok.com`;
	const qInstagram = `${parts} site:instagram.com`;

	const provider: SearchProvider = socialEnv.SEARCH_PROVIDER;

	async function searchBing(q: string): Promise<string[]> {
		if (!socialEnv.BING_KEY) return [];
		const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(q)}&mkt=en-GB&count=${limit}&responseFilter=Webpages`;
		try {
			const data = await fetchJson<any>(url, {
				method: 'GET',
				headers: { 'Ocp-Apim-Subscription-Key': socialEnv.BING_KEY },
				timeoutMs: 2500,
			});
			const items = (data?.webPages?.value ?? []) as Array<{ url: string }>;
			return items.map((i) => i.url).filter(Boolean);
		} catch {
			return [];
		}
	}

	async function searchSerpApi(q: string): Promise<string[]> {
		if (!socialEnv.SERPAPI_KEY) return [];
		const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(q)}&api_key=${socialEnv.SERPAPI_KEY}`;
		try {
			const data = await fetchJson<any>(url, { method: 'GET', timeoutMs: 4000 });
			const items = (data?.organic_results ?? []) as Array<{ link?: string }>;
			return items.map((i) => i.link || '').filter(Boolean);
		} catch {
			return [];
		}
	}

	async function run(q: string): Promise<string[]> {
		if (provider === 'bing') return searchBing(q);
		if (provider === 'serpapi') return searchSerpApi(q);
		return [];
	}

	const [tt, ig] = await Promise.all([run(qTikTok), run(qInstagram)]);
	const urls = [...tt, ...ig];
	const filtered = urls.filter((u) => isTikTokPostUrl(u) || isInstagramPostUrl(u));
	// Deduplicate and cap
	const seen = new Set<string>();
	const deduped: string[] = [];
	for (const u of filtered) {
		const key = u.replace(/\/?$/, '/');
		if (!seen.has(key)) {
			seen.add(key);
			deduped.push(u);
		}
		if (deduped.length >= limit) break;
	}
	return deduped.slice(0, limit);
}