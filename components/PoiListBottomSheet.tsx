import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { FlatList, Pressable } from 'react-native';
import BottomSheet from './BottomSheet';
import PoiCard from './PoiCard';
import type { Poi } from '../types';

export interface PoiListHandle {
  scrollToIndex: (index: number, animated?: boolean) => void;
}

interface Props {
  expanded: boolean;
  pois: Poi[];
  activeIndex: number;
  onSnapExpanded: () => void;
  onSnapCollapsed: () => void;
  onItemVisible?: (index: number) => void;
  onItemPress?: (index: number, poi: Poi) => void;
}

const PoiListBottomSheet = forwardRef<PoiListHandle, Props>(({ 
  expanded,
  pois,
  activeIndex,
  onSnapExpanded,
  onSnapCollapsed,
  onItemVisible,
  onItemPress,
}, ref) => {
  const listRef = useRef<FlatList<Poi>>(null);

  useImperativeHandle(ref, () => ({
    scrollToIndex: (index: number, animated: boolean = true) => {
      if (!listRef.current) return;
      const clamped = Math.max(0, Math.min(index, pois.length - 1));
      listRef.current.scrollToIndex({ index: clamped, animated, viewPosition: 0.1 });
    },
  }), [pois.length]);

  return (
    <BottomSheet expanded={expanded} onSnapExpanded={onSnapExpanded} onSnapCollapsed={onSnapCollapsed}>
      <FlatList
        ref={listRef}
        data={pois}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Pressable onPress={() => onItemPress?.(index, item)}>
            <PoiCard poi={item} />
          </Pressable>
        )}
        onViewableItemsChanged={({ viewableItems }) => {
          if (!viewableItems?.length) return;
          const first = viewableItems[0];
          if (typeof first?.index === 'number') onItemVisible?.(first.index);
        }}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        getItemLayout={(_, index) => ({ length: 140, offset: 140 * index, index })}
      />
    </BottomSheet>
  );
});

export default PoiListBottomSheet;