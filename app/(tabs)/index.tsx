import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet from '../../components/BottomSheet';
import PoiMarker from '../../components/PoiMarker';
import SearchBar from '../../components/SearchBar';
import { mockPOIs, POI } from '../../data/pois';

interface GeocodingResult {
  place_name: string;
  center: [number, number]; // [longitude, latitude]
}

export default function MapScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 51.5074, // London coordinates
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
  
  // POI states
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);
  const [pois] = useState<POI[]>(mockPOIs);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  
  const mapRef = useRef<MapView>(null);
  const listRef = useRef<FlatList<POI>>(null);

  useEffect(() => {
    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationStatus('denied');
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show your current location on the map.',
          [{ text: 'OK' }]
        );
        return;
      }

      setLocationStatus('granted');

      // Get current location
      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        const coords = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };
        
        setUserLocation(coords);
        
        // Update map region to user's location
        setRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationStatus('error');
        Alert.alert(
          'Location Error',
          'Unable to get your current location. The map will show London as default.',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);

  const searchLocation = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      // Replace with your Mapbox access token
      const MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN';
      const encodedQuery = encodeURIComponent(query);
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Geocoding request failed');
      }
      
      if (data.features && data.features.length > 0) {
        const result: GeocodingResult = data.features[0];
        const [longitude, latitude] = result.center;
        
        // Animate map to the found location
        const newRegion: Region = {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        
        setRegion(newRegion);
        
        // Animate the map
        mapRef.current?.animateToRegion(newRegion, 1000);
        
        // Clear search query after successful search
        setSearchQuery('');
      } else {
        setSearchError('No location found for this search');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setSearchError('Failed to search location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = () => {
    searchLocation(searchQuery);
  };

  const handlePoiPress = (poi: POI) => {
    setSelectedPoiId(poi.id);
    
    // Animate map to POI location
    const newRegion: Region = {
      latitude: poi.lat,
      longitude: poi.lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
    
    // Scroll list to the selected POI
    const poiIndex = pois.findIndex(p => p.id === poi.id);
    if (poiIndex !== -1) {
      listRef.current?.scrollToIndex({
        index: poiIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  const handleMarkerPress = (poi: POI) => {
    setSelectedPoiId(poi.id);
    
    // Animate map to marker
    const newRegion = {
      latitude: poi.lat,
      longitude: poi.lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
    
    // Scroll list to item
    const poiIndex = pois.findIndex(p => p.id === poi.id);
    if (poiIndex !== -1 && listRef.current) {
      listRef.current.scrollToIndex({
        index: poiIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };

  const renderPoiItem = ({ item, index }: { item: POI; index: number }) => {
    const isSelected = selectedPoiId === item.id;
    
    return (
      <TouchableOpacity
        style={[styles.poiCard, isSelected && styles.selectedPoiCard]}
        onPress={() => handlePoiPress(item)}
      >
        <View style={styles.poiHeader}>
          <View style={styles.poiInfo}>
            <Text style={[styles.poiName, isSelected && styles.selectedPoiName]}>
              {item.name}
            </Text>
            <Text style={styles.poiDistance}>
              {index + 1} of {pois.length}
            </Text>
          </View>
          <Ionicons 
            name="location" 
            size={20} 
            color={isSelected ? '#2196F3' : '#666'} 
          />
        </View>
        
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, tagIndex) => (
            <View key={tagIndex} style={[styles.tag, isSelected && styles.selectedTag]}>
              <Text style={[styles.tagText, isSelected && styles.selectedTagText]}>
                {tag}
              </Text>
            </View>
          ))}
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
      case 'granted': return 'location';
      case 'denied': return 'location-outline';
      case 'error': return 'warning';
      default: return 'location-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Ionicons name="map" size={24} color="#fff" />
            <Text style={styles.title}>Pinpoint</Text>
          </View>
          
          {/* Status Indicator */}
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
            <Ionicons name={getStatusIcon()} size={16} color="#fff" />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
      </View>

      {/* Map Container */}
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
          {/* POI Markers */}
          {pois.map((poi) => (
            <PoiMarker
              key={poi.id}
              poi={poi}
              onPress={handleMarkerPress}
              isSelected={selectedPoiId === poi.id}
            />
          ))}
        </MapView>
        
        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearching={isSearching}
          searchError={searchError}
          onSubmit={handleSearchSubmit}
        />
        
        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => {
            if (userLocation) {
              const newRegion = {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              };
              setRegion(newRegion);
              mapRef.current?.animateToRegion(newRegion, 1000);
            }
          }}
        >
          <Ionicons name="locate" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* POI List */}
      <BottomSheet
        expanded={isBottomSheetExpanded}
        onSnapExpanded={() => setIsBottomSheetExpanded(true)}
        onSnapCollapsed={() => setIsBottomSheetExpanded(false)}
      >
        <FlatList
          ref={listRef}
          data={pois}
          renderItem={renderPoiItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          style={styles.list}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  listContent: {
    padding: 10,
  },
  list: {
    flex: 1,
  },
  poiCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPoiCard: {
    borderColor: '#2196F3',
    borderWidth: 2,
    backgroundColor: '#f8f9ff',
  },
  poiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  poiInfo: {
    flex: 1,
  },
  poiName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedPoiName: {
    color: '#2196F3',
  },
  poiDistance: {
    fontSize: 12,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  tag: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedTag: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  tagText: {
    fontSize: 12,
    color: '#333',
  },
  selectedTagText: {
    color: '#1976d2',
  },
});
