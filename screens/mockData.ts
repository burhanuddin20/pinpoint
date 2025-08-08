export type Poi = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  summary?: string;
  tags?: string[];
  rating?: number;
};

export const MOCK_DATA: Poi[] = [
  {
    id: 'british-museum',
    name: 'The British Museum',
    lat: 51.519413,
    lon: -0.126957,
    summary: 'Vast collection of world art and artefacts.',
    tags: ['museum', 'history'],
    rating: 4.8,
  },
  {
    id: 'tower-of-london',
    name: 'Tower of London',
    lat: 51.508112,
    lon: -0.075949,
    summary: 'Historic castle on the north bank of the Thames.',
    tags: ['castle', 'history'],
    rating: 4.7,
  },
  {
    id: 'buckingham-palace',
    name: 'Buckingham Palace',
    lat: 51.501364,
    lon: -0.14189,
    summary: 'Royal residence and administrative headquarters.',
    tags: ['royal', 'landmark'],
    rating: 4.6,
  },
  {
    id: 'london-eye',
    name: 'London Eye',
    lat: 51.503324,
    lon: -0.119543,
    summary: 'Iconic riverside observation wheel.',
    tags: ['view', 'landmark'],
    rating: 4.5,
  },
  {
    id: 'tate-modern',
    name: 'Tate Modern',
    lat: 51.507595,
    lon: -0.099356,
    summary: 'Modern art gallery housed in a former power station.',
    tags: ['art', 'museum'],
    rating: 4.6,
  },
  {
    id: 'st-pauls',
    name: "St Paul's Cathedral",
    lat: 51.513845,
    lon: -0.098351,
    summary: 'Iconic Anglican cathedral with a world-famous dome.',
    tags: ['cathedral', 'landmark'],
    rating: 4.7,
  },
  {
    id: 'covent-garden',
    name: 'Covent Garden',
    lat: 51.511553,
    lon: -0.123179,
    summary: 'Shopping and entertainment hub in the West End.',
    tags: ['market', 'shopping'],
    rating: 4.6,
  },
  {
    id: 'hyde-park',
    name: 'Hyde Park',
    lat: 51.507268,
    lon: -0.16573,
    summary: 'One of London’s eight Royal Parks.',
    tags: ['park', 'nature'],
    rating: 4.7,
  },
];