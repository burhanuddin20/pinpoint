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
const EXPANDED_Y = 100; // Almost at the top, just below search bar
const HALFWAY_Y = windowHeight * 0.5; // Halfway up, showing nav bar
const COLLAPSED_Y = windowHeight - 80; // Just showing count at bottom
const COLLAPSED_VISIBLE_HEIGHT = 80; // Height visible when collapsed

export default function BottomSheet({ expanded, onSnapExpanded, onSnapCollapsed, children }: Props) {
	const [isDragging, setIsDragging] = useState(false);
	const snapY = useRef(new Animated.Value(expanded ? EXPANDED_Y : COLLAPSED_Y)).current;
	const dragY = useRef(new Animated.Value(0)).current;
	const panRef = useRef(null);

	// Combine snap and drag with clamped range for natural elasticity
	const combinedY = Animated.add(snapY, dragY);
	const translateY = combinedY.interpolate({
		inputRange: [EXPANDED_Y - 40, COLLAPSED_Y + 40],
		outputRange: [EXPANDED_Y - 20, COLLAPSED_Y + 20],
		extrapolate: 'clamp',
	});

	const snapToPosition = (toExpanded: boolean) => {
		const targetY = toExpanded ? EXPANDED_Y : COLLAPSED_Y;
		
		Animated.spring(snapY, {
			toValue: targetY,
			useNativeDriver: true,
			tension: 130,
			friction: 12,
		}).start();
	};

	const onGestureEvent = Animated.event(
		[{ nativeEvent: { translationY: dragY } }],
		{ useNativeDriver: true }
	);

	const onHandlerStateChange = (event: any) => {
		const { state, velocityY } = event.nativeEvent;
		
		if (state === State.BEGAN) {
			setIsDragging(true);
		}
		
		if (state === State.END || state === State.CANCELLED) {
			setIsDragging(false);
			
			const currentSnapY = (snapY as any)._value;
			const currentDragY = (dragY as any)._value;
			const currentY = currentSnapY + currentDragY;
			
			// Determine which snap point to go to based on current position and velocity
			let targetY;
			if (currentY < HALFWAY_Y) {
				targetY = EXPANDED_Y;
			} else if (currentY < COLLAPSED_Y) {
				targetY = HALFWAY_Y;
			} else {
				targetY = COLLAPSED_Y;
			}
			
			// Snap to the target position
			Animated.spring(snapY, {
				toValue: targetY,
				useNativeDriver: true,
				tension: 130,
				friction: 12,
			}).start();
			
			// Call appropriate callbacks
			if (targetY === EXPANDED_Y && !expanded) {
				onSnapExpanded();
			} else if (targetY === COLLAPSED_Y && expanded) {
				onSnapCollapsed();
			}
			
			// Reset drag
			dragY.setValue(0);
		}
	};

	// Update position when expanded prop changes (but not during drag)
	React.useEffect(() => {
		if (!isDragging) {
			const targetY = expanded ? EXPANDED_Y : COLLAPSED_Y;
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
						<View style={[styles.content, { minHeight: COLLAPSED_VISIBLE_HEIGHT }]}>
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
		height: windowHeight,
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