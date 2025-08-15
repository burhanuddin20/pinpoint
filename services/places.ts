export type Poi = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  openNow?: boolean;
  phone?: string;
  website?: string;
};

const DEFAULT_BASE = 'http://localhost:3001';
const BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL as string) || DEFAULT_BASE;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export async function searchPlaces({ query, lat, lon }: { query: string; lat: number; lon: number }): Promise<Poi[]> {
  const res = await fetch(`${BASE_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, lat, lon }),
  });
  const data = await handleResponse<Poi[]>(res);
  return data;
}

export async function getNearby({ lat, lon, type = 'cafe', radius = 1500, max = 12 }: { lat: number; lon: number; type?: string; radius?: number; max?: number; }): Promise<Poi[]> {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon), type, radius: String(radius), max: String(max) });
  const res = await fetch(`${BASE_URL}/places/nearby?${params.toString()}`);
  const data = await handleResponse<Poi[]>(res);
  return data;
}