import React, { useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';

interface Props {
  expanded: boolean;
  onSnapExpanded: () => void;
  onSnapCollapsed: () => void;
  children: React.ReactNode;
}

const windowHeight = Dimensions.get('window').height;
const EXPANDED_Y = windowHeight * 0.3;
const COLLAPSED_Y = windowHeight - 160;

export default function BottomSheet({ expanded, onSnapExpanded, onSnapCollapsed, children }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const snapY = useRef(new Animated.Value(expanded ? EXPANDED_Y : COLLAPSED_Y)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const panRef = useRef(null);

  const translateY = Animated.add(snapY, dragY);

  const snapToPosition = (toExpanded: boolean) => {
    const targetY = toExpanded ? EXPANDED_Y : COLLAPSED_Y;
    
    Animated.spring(snapY, {
      toValue: targetY,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: dragY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    const { state, translationY, velocityY } = event.nativeEvent;
    
    if (state === State.BEGAN) {
      setIsDragging(true);
    }
    
    if (state === State.END || state === State.CANCELLED) {
      setIsDragging(false);
      
      const currentSnapY = snapY._value;
      const currentDragY = dragY._value;
      const currentY = currentSnapY + currentDragY;
      const shouldExpand = velocityY < -500 || currentY < (EXPANDED_Y + COLLAPSED_Y) / 2;
      
      if (shouldExpand && !expanded) {
        snapToPosition(true);
        onSnapExpanded();
      } else if (!shouldExpand && expanded) {
        snapToPosition(false);
        onSnapCollapsed();
      } else {
        // Snap back to current position
        snapToPosition(expanded);
      }
      
      // Reset drag
      dragY.setValue(0);
    }
  };

  // Update position when expanded prop changes (but not during drag)
  React.useEffect(() => {
    if (!isDragging) {
      snapToPosition(expanded);
    }
  }, [expanded, isDragging]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        <PanGestureHandler 
          ref={panRef}
          onGestureEvent={onGestureEvent} 
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}> 
            <View style={styles.grabberContainer}>
              <View style={styles.grabber} />
            </View>
            <View style={styles.content}>
              {children}
            </View>
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
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