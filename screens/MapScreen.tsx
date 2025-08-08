import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import MapView, { Marker, LatLng } from 'react-native-maps';
import NavBar from '../components/NavBar';
import PoiListBottomSheet, { PoiListHandle } from '../components/PoiListBottomSheet';
import SearchBar from '../components/SearchBar';
import * as Location from 'expo-location';
import type { Poi } from '../types';
import { fetchNearbyPlaces } from '../services/places';

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');

export default function MapScreen() {
  const [pois, setPois] = useState<Poi[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const mapRef = useRef<MapView>(null);
  const listRef = useRef<PoiListHandle>(null);

  const initialRegion = useMemo(() => {
    const fallback = {
      latitude: userLocation?.lat ?? 51.5072,
      longitude: userLocation?.lon ?? -0.1276,
      latitudeDelta: 0.2,
      longitudeDelta: 0.2,
    };
    if (pois.length === 0) return fallback;
    const avgLat = pois.reduce((sum, p) => sum + p.lat, 0) / pois.length;
    const avgLon = pois.reduce((sum, p) => sum + p.lon, 0) / pois.length;
    return {
      latitude: avgLat,
      longitude: avgLon,
      latitudeDelta: 0.2,
      longitudeDelta: 0.2,
    };
  }, [pois, userLocation]);

  const parseIntent = useCallback((q: string) => {
    const lower = q.toLowerCase();
    if (lower.includes('coffee') || lower.includes('cafe')) {
      return { type: 'cafe' as const, query: undefined };
    }
    if (lower.includes('pizza')) {
      return { type: 'restaurant' as const, query: 'pizza' };
    }
    return { type: 'restaurant' as const, query: undefined };
  }, []);

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
      listRef.current?.scrollToIndex(ix, true);
      zoomToPoi(pois[ix]);
    }
  }, [pois, zoomToPoi]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
      }
    })();
  }, []);

  const performSearch = useCallback(async () => {
    if (!userLocation) {
      // If no permission, default to London
      const center = userLocation ?? { lat: 51.5072, lon: -0.1276 };
      const { type, query } = parseIntent(searchQuery);
      try {
        setIsSearching(true);
        setSearchError(null);
        const results = await fetchNearbyPlaces({ lat: center.lat, lon: center.lon, type, radius: 1500, query });
        setPois(results);
        setActiveIndex(0);
      } catch (e: any) {
        setSearchError('Network error. Please try again.');
      } finally {
        setIsSearching(false);
      }
      return;
    }
    const center = userLocation;
    const { type, query } = parseIntent(searchQuery);
    try {
      setIsSearching(true);
      setSearchError(null);
      const results = await fetchNearbyPlaces({ lat: center.lat, lon: center.lon, type, radius: 1500, query });
      setPois(results);
      setActiveIndex(0);
    } catch (e: any) {
      setSearchError('Network error. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [parseIntent, searchQuery, userLocation]);

  // Debounce search input 300ms
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch();
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, performSearch]);

  return (
    <View style={styles.container}>
      <NavBar visible={sheetExpanded} />
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {pois.map((p) => (
          <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lon }} onPress={() => onMarkerPress(p.id)} />
        ))}
      </MapView>

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearching={isSearching}
        searchError={searchError}
        onSubmit={performSearch}
      />

      {pois.length > 0 && (
        <PoiListBottomSheet
          ref={listRef}
          expanded={sheetExpanded}
          pois={pois}
          activeIndex={activeIndex}
          onSnapExpanded={() => {
            setSheetExpanded(true);
            fitAll();
          }}
          onSnapCollapsed={() => {
            setSheetExpanded(false);
            const p = pois[activeIndex];
            if (p) zoomToPoi(p);
          }}
          onItemVisible={(ix) => {
            setActiveIndex(ix);
            if (!sheetExpanded && pois[ix]) {
              zoomToPoi(pois[ix]);
            }
          }}
          onItemPress={(ix) => {
            setActiveIndex(ix);
            const p = pois[ix];
            if (p) {
              zoomToPoi(p);
              listRef.current?.scrollToIndex(ix, true);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});