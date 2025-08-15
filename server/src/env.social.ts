import './env';

export type SearchProvider = 'bing' | 'serpapi';

export const socialEnv = {
	SEARCH_PROVIDER: (process.env.SEARCH_PROVIDER as SearchProvider) || 'bing',
	BING_KEY: process.env.BING_KEY || '',
	SERPAPI_KEY: process.env.SERPAPI_KEY || '',
	IG_APP_ID: process.env.IG_APP_ID || '',
	IG_APP_TOKEN: process.env.IG_APP_TOKEN || '',
};

export function hasInstagramOEmbed(): boolean {
	return Boolean(socialEnv.IG_APP_ID && socialEnv.IG_APP_TOKEN);
}