import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import MapView, { Marker, LatLng } from 'react-native-maps';
import BottomSheet from '../components/BottomSheet';
import NavBar from '../components/NavBar';
import PoiCarousel, { PoiCarouselHandle } from '../components/PoiCarousel';
import { MOCK_DATA, Poi } from './mockData';

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');

export default function MapScreen() {
  const [pois, setPois] = useState<Poi[]>(MOCK_DATA);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const mapRef = useRef<MapView>(null);
  const carouselRef = useRef<PoiCarouselHandle>(null);

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
            {/* Default marker */}
          </Marker>
        ))}
      </MapView>

      {pois.length > 0 && (
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
        </BottomSheet>
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