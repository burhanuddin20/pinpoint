import React from 'react';
import { FlatList, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { SocialItem } from '../services/places';

interface Props { items: SocialItem[] }

const ITEM_WIDTH = 120;
const ITEM_HEIGHT = 200;

export default function SocialStrip({ items }: Props) {
	if (!items || items.length === 0) return null;

	return (
		<View style={styles.container}>
			<FlatList
				horizontal
				data={items.slice(0, 3)}
				keyExtractor={(item, idx) => `${item.platform}:${idx}:${item.url}`}
				renderItem={({ item }) => (
					<TouchableOpacity style={styles.card} onPress={() => Linking.openURL(item.url)}>
						{item.thumbnail ? (
							<Image source={{ uri: item.thumbnail }} style={styles.image} resizeMode="cover" />
						) : (
							<View style={[styles.image, styles.fallback, item.platform === 'tiktok' ? styles.tiktokBg : styles.instagramBg]}>
								<Text style={styles.fallbackText}>{item.platform.toUpperCase()}</Text>
							</View>
						)}
						<View style={[styles.badge, item.platform === 'tiktok' ? styles.tiktokBadge : styles.instagramBadge]}>
							<Text style={styles.badgeText}>{item.platform === 'tiktok' ? 'TikTok' : 'Instagram'}</Text>
						</View>
					</TouchableOpacity>
				)}
				showsHorizontalScrollIndicator={false}
				initialNumToRender={3}
				windowSize={3}
				removeClippedSubviews
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { marginTop: 10 },
	card: {
		width: ITEM_WIDTH,
		height: ITEM_HEIGHT,
		borderRadius: 12,
		marginRight: 10,
		overflow: 'hidden',
		backgroundColor: '#eee',
	},
	image: {
		width: '100%',
		height: '100%',
	},
	fallback: {
		justifyContent: 'center',
		alignItems: 'center',
	},
	fallbackText: {
		color: '#fff',
		fontWeight: '800',
		fontSize: 16,
	},
	tiktokBg: { backgroundColor: '#111' },
	instagramBg: { backgroundColor: '#C13584' },
	badge: {
		position: 'absolute',
		top: 8,
		left: 8,
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 6,
	},
	badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
	tiktokBadge: { backgroundColor: '#000' },
	instagramBadge: { backgroundColor: '#E1306C' },
});