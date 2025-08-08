import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 51.5074, // London coordinates
    longitude: -0.1278,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [locationStatus, setLocationStatus] = useState<'loading' | 'granted' | 'denied' | 'error'>('loading');
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);

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
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
          mapType="standard"
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        />
        
        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => {
            if (userLocation) {
              setRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              });
            }
          }}
        >
          <Ionicons name="locate" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
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
});
