export type HttpMethod = 'GET' | 'POST';

export async function fetchJson<T>(url: string, options: {
	method?: HttpMethod,
	headers?: Record<string, string>,
	body?: any,
	timeoutMs?: number,
	retry?: number,
} = {}): Promise<T> {
	const { method = 'GET', headers = {}, body, timeoutMs = 2500, retry = 1 } = options;

	let lastError: any = null;
	for (let attempt = 0; attempt <= retry; attempt++) {
		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), timeoutMs);
		try {
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json', ...headers },
				body: body ? JSON.stringify(body) : undefined,
				signal: controller.signal,
			});
			clearTimeout(id);
			if (!res.ok) {
				const txt = await res.text().catch(() => '');
				throw new Error(`HTTP ${res.status}: ${txt}`);
			}
			return (await res.json()) as T;
		} catch (err) {
			lastError = err;
			if (attempt === retry) break;
		}
	}
	throw lastError ?? new Error('Unknown fetch error');
}