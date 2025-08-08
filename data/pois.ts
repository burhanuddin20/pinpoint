export interface POI {
  id: string;
  name: string;
  lat: number;
  lon: number;
  tags: string[];
}

export const mockPOIs: POI[] = [
  {
    id: '1',
    name: 'Big Ben',
    lat: 51.4994,
    lon: -0.1245,
    tags: ['Landmark', 'Historic', 'Tourist']
  },
  {
    id: '2',
    name: 'London Eye',
    lat: 51.5003,
    lon: -0.1195,
    tags: ['Attraction', 'Entertainment', 'Tourist']
  },
  {
    id: '3',
    name: 'Tower Bridge',
    lat: 51.5055,
    lon: -0.0754,
    tags: ['Bridge', 'Historic', 'Architecture']
  },
  {
    id: '4',
    name: 'Buckingham Palace',
    lat: 51.5014,
    lon: -0.1419,
    tags: ['Royal', 'Historic', 'Palace']
  },
  {
    id: '5',
    name: 'Trafalgar Square',
    lat: 51.5080,
    lon: -0.1281,
    tags: ['Square', 'Public Space', 'Historic']
  }
]; 