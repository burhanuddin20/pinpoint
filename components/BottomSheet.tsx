import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent, PanGestureHandlerStateChangeEvent, State } from 'react-native-gesture-handler';

interface Props {
  expanded: boolean;
  onSnapExpanded: () => void;
  onSnapCollapsed: () => void;
  children: React.ReactNode;
}

const windowHeight = Dimensions.get('window').height;
const EXPANDED_Y = windowHeight * 0.3; // top edge when expanded (sheet covers ~70%)
const COLLAPSED_Y = windowHeight - 160; // 160px tall when collapsed

export default function BottomSheet({ expanded, onSnapExpanded, onSnapCollapsed, children }: Props) {
  const initialY = expanded ? EXPANDED_Y : COLLAPSED_Y;

  const snapY = useRef(new Animated.Value(initialY)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const lastSnap = useRef(initialY);

  useEffect(() => {
    const target = expanded ? EXPANDED_Y : COLLAPSED_Y;
    if (lastSnap.current !== target) {
      Animated.timing(snapY, {
        toValue: target,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        lastSnap.current = target;
      });
    }
  }, [expanded, snapY]);

  const translateY = useMemo(() => {
    const added = Animated.add(snapY, dragY);
    return added.interpolate({
      inputRange: [EXPANDED_Y, COLLAPSED_Y],
      outputRange: [EXPANDED_Y, COLLAPSED_Y],
      extrapolate: 'clamp',
    });
  }, [snapY, dragY]);

  const onGestureEvent = Animated.event<PanGestureHandlerGestureEvent['nativeEvent']>(
    [{ nativeEvent: { translationY: dragY } }],
    { useNativeDriver: false }
  );

  const handleStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    const { state, velocityY, translationY } = event.nativeEvent as any;
    if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
      const startY = lastSnap.current;
      const currentUnclamped = startY + (typeof translationY === 'number' ? translationY : 0);
      const currentY = Math.max(EXPANDED_Y, Math.min(currentUnclamped, COLLAPSED_Y));
      const midpoint = (EXPANDED_Y + COLLAPSED_Y) / 2;
      const shouldCollapse = velocityY > 400 || currentY > midpoint;
      const target = shouldCollapse ? COLLAPSED_Y : EXPANDED_Y;

      Animated.timing(snapY, {
        toValue: target,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        lastSnap.current = target;
      });

      dragY.setValue(0);

      if (shouldCollapse) {
        onSnapCollapsed();
      } else {
        onSnapExpanded();
      }
    }
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={handleStateChange}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}> 
          <View style={styles.grabberContainer}>
            <View style={styles.grabber} />
          </View>
          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 12,
    elevation: 12,
    paddingBottom: 16,
  },
  grabberContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ddd',
  },
  content: {
    paddingTop: 8,
  },
});