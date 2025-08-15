import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Callout, Marker } from 'react-native-maps';
import type { Poi } from '../services/places';

interface PoiMarkerProps {
  poi: Poi;
  onPress: (poi: Poi) => void;
  isSelected?: boolean;
}

export default function PoiMarker({ poi, onPress, isSelected = false }: PoiMarkerProps) {
  return (
    <Marker
      coordinate={{
        latitude: poi.lat,
        longitude: poi.lon,
      }}
      onPress={() => onPress(poi)}
      pinColor={isSelected ? '#2196F3' : '#FF5722'}
    >
      <Callout tooltip>
        <View style={styles.calloutContainer}>
          <Text style={styles.calloutTitle}>{poi.name}</Text>
          {typeof poi.rating === 'number' && (
            <Text style={styles.rating}>⭐ {poi.rating.toFixed(1)}</Text>
          )}
          {!!poi.formattedAddress && (
            <Text style={styles.address} numberOfLines={2}>{poi.formattedAddress}</Text>
          )}
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  calloutContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  rating: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: '#666',
  },
}); 