import { env } from './env';
import { fetchJson } from './http';

const BASE = 'https://places.googleapis.com/v1';

export type NearbySearchBody = {
	includedTypes: string[];
	maxResultCount?: number;
	locationRestriction: {
		circle: { center: { latitude: number; longitude: number }; radius: number };
	};
};

export type TextSearchBody = {
	textQuery: string;
	locationBias?: { circle: { center: { latitude: number; longitude: number }; radius: number } };
	maxResultCount?: number;
};

const searchFieldMask = 'places.id,places.displayName,places.location,places.formattedAddress,places.rating,places.userRatingCount,places.currentOpeningHours.openNow';
const detailsFieldMask = 'id,displayName,internationalPhoneNumber,websiteUri,currentOpeningHours,editorialSummary,photos.name';

export function buildHeaders(fieldMask: string) {
	return {
		'X-Goog-Api-Key': env.GOOGLE_PLACES_KEY,
		'X-Goog-FieldMask': fieldMask,
	};
}

export async function searchNearby(body: NearbySearchBody) {
	return fetchJson<any>(`${BASE}/places:searchNearby`, {
		method: 'POST',
		headers: buildHeaders(searchFieldMask),
		body,
	});
}

export async function searchText(body: TextSearchBody) {
	return fetchJson<any>(`${BASE}/places:searchText`, {
		method: 'POST',
		headers: buildHeaders(searchFieldMask),
		body,
	});
}

export async function getDetails(placeId: string) {
	const id = placeId.startsWith('places/') ? placeId : `places/${placeId}`;
	return fetchJson<any>(`${BASE}/${id}`, {
		method: 'GET',
		headers: buildHeaders(detailsFieldMask),
	});
}

export function mapPlaceSummary(p: any) {
	return {
		id: p.id as string,
		name: p.displayName?.text as string,
		lat: p.location?.latitude as number,
		lon: p.location?.longitude as number,
		formattedAddress: p.formattedAddress as string | undefined,
		rating: p.rating as number | undefined,
		userRatingCount: p.userRatingCount as number | undefined,
		openNow: p.currentOpeningHours?.openNow as boolean | undefined,
	};
}

export function mapPlaceDetails(p: any) {
	return {
		id: p.id as string,
		name: p.displayName?.text as string,
		phone: p.internationalPhoneNumber as string | undefined,
		website: p.websiteUri as string | undefined,
		openingHours: p.currentOpeningHours,
		editorialSummary: p.editorialSummary?.text as string | undefined,
		photoNames: (p.photos ?? []).map((ph: any) => ph.name as string),
	};
}

export function buildPhotoUrl(photoName: string): string {
	return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=600&key=${env.GOOGLE_PLACES_KEY}`;
}