import React, { useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';

interface Props {
	expanded: boolean;
	onSnapExpanded: () => void;
	onSnapCollapsed: () => void;
	onSnapHalfway?: () => void;
	children: React.ReactNode;
}

const windowHeight = Dimensions.get('window').height;
const EXPANDED_Y = 120; // Just below search bar with some padding
const HALFWAY_Y = windowHeight * 0.4; // 40% up the screen for better visibility
const COLLAPSED_Y = windowHeight - 100; // Just showing count at bottom, but not below screen
const COLLAPSED_VISIBLE_HEIGHT = 100; // Height visible when collapsed

export default function BottomSheet({ expanded, onSnapExpanded, onSnapCollapsed, onSnapHalfway, children }: Props) {
	const [isDragging, setIsDragging] = useState(false);
	const [currentSnapPoint, setCurrentSnapPoint] = useState<'collapsed' | 'halfway' | 'expanded'>(
		expanded ? 'expanded' : 'collapsed'
	);
	
	const snapY = useRef(new Animated.Value(expanded ? EXPANDED_Y : COLLAPSED_Y)).current;
	const dragY = useRef(new Animated.Value(0)).current;
	const panRef = useRef(null);

	// console.log(`🚀 BottomSheet initialized:`);
	// console.log(`   - expanded prop: ${expanded}`);
	// console.log(`   - currentSnapPoint: ${currentSnapPoint}`);
	// console.log(`   - EXPANDED_Y: ${EXPANDED_Y}`);
	// console.log(`   - HALFWAY_Y: ${HALFWAY_Y}`);
	// console.log(`   - COLLAPSED_Y: ${COLLAPSED_Y}`);
	// console.log(`   - initial snapY: ${expanded ? EXPANDED_Y : COLLAPSED_Y}`);

	// Combine snap and drag with clamped range for natural elasticity
	const combinedY = Animated.add(snapY, dragY);
	const translateY = combinedY.interpolate({
		inputRange: [EXPANDED_Y - 40, COLLAPSED_Y + 40],
		outputRange: [EXPANDED_Y - 20, COLLAPSED_Y + 20],
		extrapolate: 'clamp',
	});

	const snapToPosition = (snapPoint: 'collapsed' | 'halfway' | 'expanded') => {
		let targetY: number;
		
		switch (snapPoint) {
			case 'expanded':
				targetY = EXPANDED_Y;
				break;
			case 'halfway':
				targetY = HALFWAY_Y;
				break;
			case 'collapsed':
				targetY = COLLAPSED_Y;
				break;
		}
		
		// console.log(`🎯 SNAPPING: ${currentSnapPoint} → ${snapPoint}`);
		
		Animated.spring(snapY, {
			toValue: targetY,
			useNativeDriver: true,
			tension: 130,
			friction: 12,
		}).start();
		
		setCurrentSnapPoint(snapPoint);
	};

	const onGestureEvent = Animated.event(
		[{ nativeEvent: { translationY: dragY } }],
		{ useNativeDriver: true }
	);

	const onHandlerStateChange = (event: any) => {
		const { state, velocityY, translationY } = event.nativeEvent;
		
		if (state === State.BEGAN) {
			setIsDragging(true);
		}
		
		if (state === State.END || state === State.CANCELLED) {
			setIsDragging(false);
			
			const currentSnapY = (snapY as any)._value;
			const currentDragY = (dragY as any)._value;
			const currentY = currentSnapY + currentDragY;
			
			// Determine which snap point to go to based on current position and velocity
			let targetSnapPoint: 'collapsed' | 'halfway' | 'expanded';
			
			// Check if we've moved significantly in any direction
			const hasMovedUp = translationY < -50;
			const hasMovedDown = translationY > 50;
			
			// console.log(`📊 GESTURE: velocity=${velocityY.toFixed(0)}, translation=${translationY.toFixed(0)}, current=${currentSnapPoint}`);
			
			// Lower velocity threshold for better responsiveness
			if (velocityY < -200 || hasMovedUp) {
				// Swiping up - go to next state
				if (currentSnapPoint === 'collapsed') {
					targetSnapPoint = 'halfway';
				} else if (currentSnapPoint === 'halfway') {
					targetSnapPoint = 'expanded';
				} else {
					targetSnapPoint = 'expanded';
				}
				// console.log(`⬆️  UP: ${currentSnapPoint} → ${targetSnapPoint}`);
			} else if (velocityY > 200 || hasMovedDown) {
				// Swiping down - go to previous state
				if (currentSnapPoint === 'expanded') {
					targetSnapPoint = 'halfway';
				} else if (currentSnapPoint === 'halfway') {
					targetSnapPoint = 'collapsed';
				} else {
					targetSnapPoint = 'collapsed';
				}
				// console.log(`⬇️  DOWN: ${currentSnapPoint} → ${targetSnapPoint}`);
			} else {
				// Low velocity - snap based on position with better thresholds
				if (currentY < HALFWAY_Y * 0.8) {
					targetSnapPoint = 'expanded';
				} else if (currentY < COLLAPSED_Y * 0.9) {
					targetSnapPoint = 'halfway';
				} else {
					targetSnapPoint = 'collapsed';
				}
				// console.log(`📍 POSITION: ${currentSnapPoint} → ${targetSnapPoint}`);
			}
			
			// Snap to the target position
			snapToPosition(targetSnapPoint);
			
			// Call appropriate callbacks
			if (targetSnapPoint === 'expanded' && currentSnapPoint !== 'expanded') {
				onSnapExpanded();
			} else if (targetSnapPoint === 'collapsed' && currentSnapPoint !== 'collapsed') {
				onSnapCollapsed();
			} else if (targetSnapPoint === 'halfway' && onSnapHalfway && currentSnapPoint !== 'halfway') {
				onSnapHalfway();
			}
			
			// Reset drag
			dragY.setValue(0);
		}
	};


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
							<View style={[styles.grabber, { backgroundColor: currentSnapPoint === 'expanded' ? '#4CAF50' : currentSnapPoint === 'halfway' ? '#FF9800' : '#ddd' }]} />
							<Text style={styles.stateIndicator}>
								{currentSnapPoint === 'expanded' ? 'EXPANDED' : currentSnapPoint === 'halfway' ? 'HALFWAY' : 'COLLAPSED'}
							</Text>
						</View>
						<View style={[styles.content, { minHeight: COLLAPSED_VISIBLE_HEIGHT, flex: 1 }]}>
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
	stateIndicator: {
		marginTop: 4,
		fontSize: 12,
		color: '#888',
	},
});