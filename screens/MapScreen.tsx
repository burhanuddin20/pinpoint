import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, LatLng } from 'react-native-maps';
import BottomSheet from '../components/BottomSheet';
import NavBar from '../components/NavBar';
import PoiCarousel, { PoiCarouselHandle } from '../components/PoiCarousel';
import type { Poi } from '../services/places';
import { getNearby, searchPlaces } from '../services/places';

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');

export default function MapScreen() {
  const [pois, setPois] = useState<Poi[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [user, setUser] = useState<{ lat: number; lon: number } | null>(null);

  const mapRef = useRef<MapView>(null);
  const carouselRef = useRef<PoiCarouselHandle>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Try to center around average of POIs until user is set
    if (!user && pois.length > 0) return;
  }, [user, pois]);

  const initialRegion = useMemo(() => {
    if (pois.length === 0) {
      return {
        latitude: 51.5074,
        longitude: -0.1278,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      };
    }
    const avgLat = pois.reduce((sum, p) => sum + p.lat, 0) / pois.length;
    const avgLon = pois.reduce((sum, p) => sum + p.lon, 0) / pois.length;
    return {
      latitude: avgLat,
      longitude: avgLon,
      latitudeDelta: 0.2,
      longitudeDelta: 0.2,
    };
  }, [pois]);

  const fitAll = useCallback(() => {
    if (!mapRef.current || pois.length === 0) return;
    const coords: LatLng[] = pois.map((p) => ({ latitude: p.lat, longitude: p.lon }));
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 80, bottom: 280, left: 80 },
      animated: true,
    });
  }, [pois]);

  const zoomToPoi = useCallback((p: Poi) => {
    mapRef.current?.animateToRegion(
      {
        latitude: p.lat,
        longitude: p.lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      300
    );
  }, []);

  const onMarkerPress = useCallback((poiId: string) => {
    const ix = pois.findIndex((p) => p.id === poiId);
    if (ix >= 0) {
      setActiveIndex(ix);
      carouselRef.current?.scrollToIndex(ix, true);
      zoomToPoi(pois[ix]);
    }
  }, [pois, zoomToPoi]);

  const loadNearbyCafes = useCallback(async (center: { lat: number; lon: number }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNearby({ lat: center.lat, lon: center.lon, type: 'cafe', radius: 1500, max: 12 });
      setPois(data);
      setActiveIndex(0);
    } catch (e: any) {
      setError(e?.message || 'Failed to load places');
    } finally {
      setLoading(false);
    }
  }, []);

  const runSearch = useCallback(async (q: string, center: { lat: number; lon: number }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchPlaces({ query: q, lat: center.lat, lon: center.lon });
      setPois(data);
      setActiveIndex(0);
    } catch (e: any) {
      setError(e?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // On mount: use a default user position and load cafes (in a real app, get Location API)
    const defaultUser = { lat: 51.5074, lon: -0.1278 };
    setUser(defaultUser);
    loadNearbyCafes(defaultUser);
  }, [loadNearbyCafes]);

  useEffect(() => {
    // Debounce text input 300ms
    if (!user) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = query.trim();
      if (q.length === 0) {
        loadNearbyCafes(user);
      } else {
        runSearch(q, user);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, user, loadNearbyCafes, runSearch]);

  return (
    <View style={styles.container}>
      <NavBar visible={sheetExpanded} />
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {pois.map((p) => (
          <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lon }} onPress={() => onMarkerPress(p.id)}>
            {/* default marker */}
          </Marker>
        ))}
      </MapView>

      <BottomSheet
        expanded={sheetExpanded}
        onSnapExpanded={() => {
          setSheetExpanded(true);
          fitAll();
        }}
        onSnapCollapsed={() => {
          setSheetExpanded(false);
          const p = pois[activeIndex];
          if (p) zoomToPoi(p);
        }}
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Loading places…</Text>
          </View>
        ) : pois.length === 0 ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>No places found nearby</Text>
          </View>
        ) : (
          <PoiCarousel
            ref={carouselRef}
            data={pois}
            activeIndex={activeIndex}
            onSnapToItem={(ix) => {
              setActiveIndex(ix);
              if (!sheetExpanded && pois[ix]) {
                zoomToPoi(pois[ix]);
              }
            }}
          />
        )}
        {!!error && (
          <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginTop: 8,
    color: '#555',
  },
  errorBox: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  errorText: {
    color: '#c00',
  },
});