type CacheEntry<T> = { value: T; expiresAt: number };

class TTLCache {
	private store = new Map<string, CacheEntry<any>>();

	get<T>(key: string): T | null {
		const entry = this.store.get(key);
		if (!entry) return null;
		if (Date.now() > entry.expiresAt) {
			this.store.delete(key);
			return null;
		}
		return entry.value as T;
	}

	set<T>(key: string, value: T, ttlMs: number) {
		this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
	}

	del(key: string) {
		this.store.delete(key);
	}
}

export const cache = new TTLCache();