import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Linking, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet from '../../components/BottomSheet';
import PoiMarker from '../../components/PoiMarker';
import SearchBar from '../../components/SearchBar';
import { useBottomSheet } from '../../contexts/BottomSheetContext';
import type { Poi } from '../../services/places';
import { getNearby, searchPlaces } from '../../services/places';

export default function MapScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 51.5074,
    longitude: -0.1278,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [locationStatus, setLocationStatus] = useState<'loading' | 'granted' | 'denied' | 'error'>('loading');
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // POI states
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [pois, setPois] = useState<Poi[]>([]);
  const { isExpanded, setIsExpanded } = useBottomSheet();
  
  const mapRef = useRef<MapView>(null);
  const listRef = useRef<FlatList<Poi>>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('denied');
        Alert.alert('Permission Denied','Location permission is required to show your current location on the map.',[{ text: 'OK' }]);
        return;
      }

      setLocationStatus('granted');
      try {
        const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const coords = { latitude: currentLocation.coords.latitude, longitude: currentLocation.coords.longitude };
        setUserLocation(coords);
        const newRegion: Region = { latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 600);
        // initial nearby cafes
        setIsSearching(true);
        setSearchError(null);
        try {
          const data = await getNearby({ lat: coords.latitude, lon: coords.longitude, type: 'cafe', radius: 1500, max: 12 });
          setPois(data);
          setSelectedPoiId(data[0]?.id ?? null);
        } catch (e: any) {
          setSearchError(e?.message || 'Failed to load nearby places');
        } finally {
          setIsSearching(false);
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationStatus('error');
        Alert.alert('Location Error','Unable to get your current location. The map will show London as default.',[{ text: 'OK' }]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!userLocation) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const q = searchQuery.trim();
      setIsSearching(true);
      setSearchError(null);
      try {
        if (q.length === 0) {
          const data = await getNearby({ lat: userLocation.latitude, lon: userLocation.longitude, type: 'cafe', radius: 1500, max: 12 });
          setPois(data);
        } else {
          const data = await searchPlaces({ query: q, lat: userLocation.latitude, lon: userLocation.longitude });
          setPois(data);
        }
      } catch (e: any) {
        setSearchError(e?.message || 'Search failed');
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, userLocation]);

  const handleSubmit = async () => {
    if (!userLocation) return;
    const q = searchQuery.trim();
    if (q.length === 0) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const data = await searchPlaces({ query: q, lat: userLocation.latitude, lon: userLocation.longitude });
      setPois(data);
    } catch (e: any) {
      setSearchError(e?.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePoiPress = (poi: Poi) => {
    setSelectedPoiId(poi.id);
    const newRegion: Region = { latitude: poi.lat, longitude: poi.lon, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 600);
    const poiIndex = pois.findIndex(p => p.id === poi.id);
    if (poiIndex !== -1) {
      listRef.current?.scrollToIndex({ index: poiIndex, animated: true, viewPosition: 0.5 });
    }
  };

  const handleMarkerPress = (poi: Poi) => {
    setSelectedPoiId(poi.id);
    const newRegion = { latitude: poi.lat, longitude: poi.lon, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 600);
    const poiIndex = pois.findIndex(p => p.id === poi.id);
    if (poiIndex !== -1 && listRef.current) {
      listRef.current.scrollToIndex({ index: poiIndex, animated: true, viewPosition: 0.5 });
    }
  };

  const fitAllMarkers = () => {
    if (!mapRef.current || pois.length === 0) return;
    const coords = pois.map(p => ({ latitude: p.lat, longitude: p.lon }));
    mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 80, right: 80, bottom: 280, left: 80 }, animated: true });
  };

  const zoomToActive = () => {
    const active = selectedPoiId ? pois.find(p => p.id === selectedPoiId) : pois[0];
    if (!active) return;
    const newRegion = { latitude: active.lat, longitude: active.lon, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    mapRef.current?.animateToRegion(newRegion, 300);
  };

  const renderPoiItem = ({ item, index }: { item: Poi; index: number }) => {
    const isSelected = selectedPoiId === item.id;
    return (
      <TouchableOpacity style={[styles.poiCard, isSelected && styles.selectedPoiCard]} onPress={() => handlePoiPress(item)}>
        <View style={styles.poiHeader}>
          <View style={styles.poiInfo}>
            <Text style={[styles.poiName, isSelected && styles.selectedPoiName]}>{item.name}</Text>
            <Text style={styles.poiDistance}>{index + 1} of {pois.length}</Text>
          </View>
          <Ionicons name="location" size={20} color={isSelected ? '#2196F3' : '#666'} />
        </View>
        {!!item.formattedAddress && (
          <Text style={{ color: '#666' }} numberOfLines={2}>{item.formattedAddress}</Text>
        )}
        {typeof item.rating === 'number' && (
          <Text style={{ marginTop: 6, color: '#444' }}>⭐ {item.rating.toFixed(1)}{typeof item.userRatingCount === 'number' ? ` (${item.userRatingCount})` : ''}</Text>
        )}
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => {
              const apple = `maps://?q=${encodeURIComponent(item.name)}&ll=${item.lat},${item.lon}`;
              const gmaps = `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lon}`;
              Linking.openURL(Platform.OS === 'ios' ? apple : gmaps);
            }}
          >
            <Text style={styles.ctaText}>Directions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ctaBtn, !item.phone && styles.ctaDisabled]}
            disabled={!item.phone}
            onPress={() => item.phone && Linking.openURL(`tel:${item.phone}`)}
          >
            <Text style={styles.ctaText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ctaBtn, !item.website && styles.ctaDisabled]}
            disabled={!item.website}
            onPress={() => item.website && Linking.openURL(item.website)}
          >
            <Text style={styles.ctaText}>Website</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const getStatusColor = () => {
    switch (locationStatus) {
      case 'granted': return '#4CAF50';
      case 'denied': return '#F44336';
      case 'error': return '#FF9800';
      default: return '#2196F3';
    }
  };

  const getStatusText = () => {
    switch (locationStatus) {
      case 'granted': return 'Location Active';
      case 'denied': return 'Location Denied';
      case 'error': return 'Location Error';
      default: return 'Getting Location...';
    }
  };

  const getStatusIcon = () => {
    switch (locationStatus) {
      case 'loading': return <Ionicons name="time" size={12} color="#fff" />;
      case 'granted': return <Ionicons name="checkmark-circle" size={12} color="#fff" />;
      case 'denied': return <Ionicons name="close-circle" size={12} color="#fff" />;
      case 'error': return <Ionicons name="warning" size={12} color="#fff" />;
      default: return <Ionicons name="time" size={12} color="#fff" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Ionicons name="map" size={20} color="#fff" />
            <Text style={styles.title}>Pinpoint</Text>
          </View>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
            {getStatusIcon()}
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
          mapType="standard"
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        >
          {pois.map((poi) => (
            <PoiMarker key={poi.id} poi={poi} onPress={handleMarkerPress} isSelected={selectedPoiId === poi.id} />
          ))}
        </MapView>

        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearching={isSearching}
          searchError={searchError}
          onSubmit={handleSubmit}
        />

        <TouchableOpacity 
          style={styles.fab}
          onPress={() => {
            if (userLocation) {
              const newRegion = { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
              setRegion(newRegion);
              mapRef.current?.animateToRegion(newRegion, 600);
            }
          }}
        >
          <Ionicons name="locate" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <BottomSheet
        expanded={isExpanded}
        onSnapExpanded={() => { setIsExpanded(true); fitAllMarkers(); }}
        onSnapCollapsed={() => { setIsExpanded(false); zoomToActive(); }}
      >
        {isSearching ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>Loading places…</Text>
          </View>
        ) : pois.length === 0 ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>No places found nearby</Text>
          </View>
        ) : (
          <>
            <FlatList
              ref={listRef}
              data={pois}
              renderItem={renderPoiItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              style={styles.list}
              getItemLayout={(_, index) => ({ length: 100, offset: index * 100, index })}
            />
          </>
        )}
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  header: { backgroundColor: '#1a1a1a', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  statusIndicator: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16, gap: 4 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2196F3', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65 },
  listContent: { padding: 10 },
  list: { flex: 1 },
  poiCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#e0e0e0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  selectedPoiCard: { borderColor: '#2196F3', borderWidth: 2, backgroundColor: '#f8f9ff' },
  poiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  poiInfo: { flex: 1 },
  poiName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  selectedPoiName: { color: '#2196F3' },
  poiDistance: { fontSize: 12, color: '#666' },
  ctaRow: { flexDirection: 'row', marginTop: 10, gap: 8 },
  ctaBtn: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#111', borderRadius: 8 },
  ctaDisabled: { backgroundColor: '#777' },
  ctaText: { color: '#fff', fontWeight: '600', fontSize: 12 },
});
