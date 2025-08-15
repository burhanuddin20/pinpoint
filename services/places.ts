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

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001';

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
  const url = `${BASE_URL}/places/text?query=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}`;
  console.log('🔍 Searching places:', url);
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('📡 Response status:', res.status);
    
    const data = await handleResponse<Poi[]>(res);
    console.log('✅ Search results:', data.length, 'places found');
    return data;
  } catch (error) {
    console.error('❌ Search failed:', error);
    throw error;
  }
}

export async function getNearby({ lat, lon, type = 'cafe', radius = 1500, max = 12 }: { lat: number; lon: number; type?: string; radius?: number; max?: number; }): Promise<Poi[]> {
  const params = new URLSearchParams({ 
    lat: String(lat), 
    lon: String(lon), 
    type, 
    radius: String(radius) 
  });
  const url = `${BASE_URL}/places/nearby?${params.toString()}`;
  console.log('📍 Getting nearby places:', url);
  
  try {
    const res = await fetch(url);
    console.log('📡 Response status:', res.status);
    
    const data = await handleResponse<Poi[]>(res);
    console.log('✅ Nearby results:', data.length, 'places found');
    return data;
  } catch (error) {
    console.error('❌ Nearby search failed:', error);
    throw error;
  }
}