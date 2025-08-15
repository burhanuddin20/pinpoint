import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Animated, FlatList, Linking, ListRenderItemInfo, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Poi } from '../services/places';

export interface PoiCarouselHandle {
  scrollToIndex: (index: number, animated?: boolean) => void;
}

interface Props {
  data: Poi[];
  activeIndex: number;
  onSnapToItem: (index: number) => void;
}

const CARD_WIDTH = 300;
const SPACING = 16;

const PoiCarousel = forwardRef<PoiCarouselHandle, Props>(({ data, activeIndex, onSnapToItem }, ref) => {
  const listRef = useRef<FlatList<Poi>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const snapInterval = CARD_WIDTH + SPACING;

  useImperativeHandle(ref, () => ({
    scrollToIndex: (index: number, animated: boolean = true) => {
      if (!listRef.current) return;
      const clamped = Math.max(0, Math.min(index, data.length - 1));
      listRef.current.scrollToOffset({ offset: clamped * snapInterval, animated });
    },
  }), [data.length, snapInterval]);

  const getItemLayout = (_: Poi[] | null | undefined, index: number) => ({
    length: snapInterval,
    offset: snapInterval * index,
    index,
  });

  const keyExtractor = (item: Poi) => item.id;

  const openDirections = (p: Poi) => {
    const apple = `maps://?q=${encodeURIComponent(p.name)}&ll=${p.lat},${p.lon}`;
    const gmaps = `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`;
    const url = Platform.OS === 'ios' ? apple : gmaps;
    Linking.openURL(url);
  };

  const openPhone = (p: Poi) => {
    if (!p.phone) return;
    Linking.openURL(`tel:${p.phone}`);
  };

  const openWebsite = (p: Poi) => {
    if (!p.website) return;
    Linking.openURL(p.website);
  };

  const renderItem = ({ item, index }: ListRenderItemInfo<Poi>) => {
    const isActive = index === activeIndex;
    return (
      <Animated.View style={[styles.cardContainer, { width: CARD_WIDTH, marginRight: SPACING, transform: [{ scale: isActive ? 1 : 0.96 }] }]}> 
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {!!item.formattedAddress && <Text style={styles.summary} numberOfLines={2}>{item.formattedAddress}</Text>}
          {typeof item.rating === 'number' && (
            <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}{typeof item.userRatingCount === 'number' ? ` (${item.userRatingCount})` : ''}</Text>
          )}
          <View style={styles.ctaRow}>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => openDirections(item)}>
              <Text style={styles.ctaText}>Directions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ctaBtn, !item.phone && styles.ctaDisabled]} disabled={!item.phone} onPress={() => openPhone(item)}>
              <Text style={styles.ctaText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.ctaBtn, !item.website && styles.ctaDisabled]} disabled={!item.website} onPress={() => openWebsite(item)}>
              <Text style={styles.ctaText}>Website</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const onMomentumEnd = (ev: any) => {
    const offsetX = ev.nativeEvent.contentOffset?.x ?? 0;
    const index = Math.round(offsetX / snapInterval);
    const clamped = Math.max(0, Math.min(index, data.length - 1));
    onSnapToItem(clamped);
  };

  return (
    <Animated.FlatList
      ref={listRef}
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={snapInterval}
      decelerationRate="fast"
      bounces={false}
      onMomentumScrollEnd={onMomentumEnd}
      getItemLayout={getItemLayout}
      contentContainerStyle={styles.contentContainer}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
      scrollEventThrottle={16}
    />
  );
});

export default PoiCarousel;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  cardContainer: {
    height: 160,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  summary: {
    marginTop: 6,
    color: '#555',
  },
  rating: {
    marginTop: 8,
    fontWeight: '600',
  },
  ctaRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  ctaBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#111',
    borderRadius: 8,
  },
  ctaDisabled: {
    backgroundColor: '#777',
  },
  ctaText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});