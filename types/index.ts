export type Poi = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  rating?: number;
  user_ratings_total?: number;
  address?: string;
  phone?: string;
  website?: string;
  open_now?: boolean;
  distance_m?: number;
};