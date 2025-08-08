import React, { useMemo } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Poi } from '../types';

interface Props {
  poi: Poi;
}

export default function PoiCard({ poi }: Props) {
  const openDirections = () => {
    const label = encodeURIComponent(poi.name);
    const lat = poi.lat;
    const lon = poi.lon;
    if (Platform.OS === 'ios') {
      const url = `http://maps.apple.com/?daddr=${lat},${lon}&q=${label}`;
      Linking.openURL(url);
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&destination_place_id=${encodeURIComponent(poi.id)}&travelmode=walking`;
      Linking.openURL(url);
    }
  };

  const openCall = () => {
    if (!poi.phone) return;
    Linking.openURL(`tel:${poi.phone}`);
  };

  const openWebsite = () => {
    if (!poi.website) return;
    Linking.openURL(poi.website);
  };

  const addressLine = useMemo(() => poi.address ?? '', [poi.address]);

  return (
    <View style={styles.card}>
      <Text style={styles.title} numberOfLines={1}>{poi.name}</Text>
      <View style={styles.metaRow}>
        {typeof poi.rating === 'number' && (
          <Text style={styles.rating}>⭐ {poi.rating.toFixed(1)}</Text>
        )}
        {typeof poi.user_ratings_total === 'number' && (
          <Text style={styles.ratingsTotal}>({poi.user_ratings_total})</Text>
        )}
        {typeof poi.distance_m === 'number' && (
          <Text style={styles.distance}>{Math.round(poi.distance_m)} m</Text>
        )}
        {poi.open_now != null && (
          <View style={[styles.pill, poi.open_now ? styles.pillOpen : styles.pillClosed]}>
            <Text style={[styles.pillText, poi.open_now ? styles.pillTextOpen : styles.pillTextClosed]}>
              {poi.open_now ? 'Open now' : 'Closed'}
            </Text>
          </View>
        )}
      </View>
      {!!addressLine && <Text style={styles.address} numberOfLines={1}>{addressLine}</Text>}

      <View style={styles.actionsRow}>
        <Pressable onPress={openDirections} style={[styles.actionButton, styles.primary]}>
          <Text style={[styles.actionText, styles.primaryText]}>Directions</Text>
        </Pressable>
        <Pressable onPress={openCall} disabled={!poi.phone} style={[styles.actionButton, !poi.phone && styles.disabled]}>
          <Text style={[styles.actionText, !poi.phone && styles.disabledText]}>Call</Text>
        </Pressable>
        <Pressable onPress={openWebsite} disabled={!poi.website} style={[styles.actionButton, !poi.website && styles.disabled]}>
          <Text style={[styles.actionText, !poi.website && styles.disabledText]}>Website</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  rating: {
    fontWeight: '600',
    color: '#111',
  },
  ratingsTotal: {
    color: '#666',
  },
  distance: {
    marginLeft: 6,
    color: '#666',
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 6,
  },
  pillOpen: { backgroundColor: '#E8F5E9' },
  pillClosed: { backgroundColor: '#FFEBEE' },
  pillText: { fontSize: 12, fontWeight: '700' },
  pillTextOpen: { color: '#2E7D32' },
  pillTextClosed: { color: '#C62828' },
  address: {
    color: '#555',
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
  actionText: { fontWeight: '600', color: '#111' },
  primary: { backgroundColor: '#111' },
  primaryText: { color: '#fff' },
  disabled: { opacity: 0.5 },
  disabledText: { color: '#999' },
});