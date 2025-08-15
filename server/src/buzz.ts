export function computeBuzzScore({ recentCount, totalCount, rating }: { recentCount: number; totalCount: number; rating?: number }): number {
	const ratingBoost = rating ? Math.min(1, Math.max(0, (rating - 3.5) / 1.5)) : 0;
	return 2 * recentCount + 1 * totalCount + 0.5 * ratingBoost;
}