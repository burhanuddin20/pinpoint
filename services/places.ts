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
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await handleResponse<Poi[]>(response);
    return data.slice(0, 5); // Limit to 5 results for testing
  } catch (error) {
    console.error('Error searching places:', error);
    throw error;
  }
}

export async function getNearby({ lat, lon, type = 'cafe', radius = 1500 }: { lat: number; lon: number; type?: string; radius?: number }): Promise<Poi[]> {
  const url = `${BASE_URL}/places/nearby?lat=${lat}&lon=${lon}&type=${type}&radius=${radius}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await handleResponse<Poi[]>(response);
    return data.slice(0, 5); // Limit to 5 results for testing
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    throw error;
  }
}