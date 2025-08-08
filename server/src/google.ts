import axios from 'axios';

const AXIOS = axios.create({
  timeout: 5000,
});

export interface NearbyPlace {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  vicinity?: string;
  geometry: { location: { lat: number; lng: number } };
  opening_hours?: { open_now?: boolean };
}

export async function nearbySearch(params: {
  apiKey: string;
  lat: number;
  lon: number;
  radius: number;
  type: string;
  keyword?: string;
}): Promise<{ results: NearbyPlace[] }> {
  const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
  const { apiKey, lat, lon, radius, type, keyword } = params;

  const { data } = await AXIOS.get(url, {
    params: {
      key: apiKey,
      location: `${lat},${lon}`,
      radius,
      type,
      keyword,
      opennow: false,
    },
  });

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`NearbySearch failed: ${data.status}`);
  }

  return { results: data.results as NearbyPlace[] };
}

export async function placeDetails(params: { apiKey: string; placeId: string }): Promise<{
  formatted_address?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  opening_hours?: { open_now?: boolean };
  website?: string;
}> {
  const url = 'https://maps.googleapis.com/maps/api/place/details/json';
  const { apiKey, placeId } = params;
  const fields = [
    'formatted_address',
    'formatted_phone_number',
    'international_phone_number',
    'opening_hours/open_now',
    'website',
  ].join(',');

  const { data } = await AXIOS.get(url, {
    params: {
      key: apiKey,
      place_id: placeId,
      fields,
    },
  });

  if (data.status !== 'OK') {
    throw new Error(`PlaceDetails failed: ${data.status}`);
  }

  return data.result ?? {};
}