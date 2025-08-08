import Constants from 'expo-constants';
import type { Poi } from '../types';

const BACKEND_URL: string | undefined = (Constants.expoConfig?.extra as any)?.BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL as string | undefined;

export async function fetchNearbyPlaces(params: { lat: number; lon: number; type?: string; radius?: number; query?: string }): Promise<Poi[]> {
  const { lat, lon, type = 'restaurant', radius = 1500, query } = params;
  const baseUrl = BACKEND_URL || 'http://localhost:4000';
  const url = new URL('/places/nearby', baseUrl).toString();
  const qs = new URLSearchParams();
  qs.set('lat', String(lat));
  qs.set('lon', String(lon));
  if (type) qs.set('type', type);
  if (radius) qs.set('radius', String(radius));
  if (query) qs.set('query', query);

  const res = await fetch(`${url}?${qs.toString()}`, { method: 'GET' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return data as Poi[];
}

export function fitToAllPois(mapRef: any, pois: Poi[]) {
  if (!mapRef?.current || !pois?.length) return;
  const coords = pois.map(p => ({ latitude: p.lat, longitude: p.lon }));
  mapRef.current.fitToCoordinates(coords, {
    edgePadding: { top: 80, right: 80, bottom: 280, left: 80 },
    animated: true,
  });
}