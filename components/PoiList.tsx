import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { POI } from '../data/pois';

interface PoiListProps {
  pois: POI[];
  selectedPoiId: string | null;
  onPoiPress: (poi: POI) => void;
  listRef: React.RefObject<FlatList<POI>>;
}

export default function PoiList({ pois, selectedPoiId, onPoiPress, listRef }: PoiListProps) {
  const renderPoiItem = ({ item, index }: { item: POI; index: number }) => {
    const isSelected = selectedPoiId === item.id;
    
    return (
      <TouchableOpacity
        style={[styles.poiCard, isSelected && styles.selectedPoiCard]}
        onPress={() => onPoiPress(item)}
      >
        <View style={styles.poiHeader}>
          <View style={styles.poiInfo}>
            <Text style={[styles.poiName, isSelected && styles.selectedPoiName]}>
              {item.name}
            </Text>
            <Text style={styles.poiDistance}>
              {index + 1} of {pois.length}
            </Text>
          </View>
          <Ionicons 
            name="location" 
            size={20} 
            color={isSelected ? '#2196F3' : '#666'} 
          />
        </View>
        
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, tagIndex) => (
            <View key={tagIndex} style={[styles.tag, isSelected && styles.selectedTag]}>
              <Text style={[styles.tagText, isSelected && styles.selectedTagText]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Points of Interest</Text>
        <Text style={styles.headerSubtitle}>{pois.length} locations</Text>
      </View>
      
      <FlatList
        ref={listRef}
        data={pois}
        renderItem={renderPoiItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  list: {
    maxHeight: 300,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  poiCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedPoiCard: {
    borderColor: '#2196F3',
    backgroundColor: '#F3F8FF',
  },
  poiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  poiInfo: {
    flex: 1,
  },
  poiName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  selectedPoiName: {
    color: '#2196F3',
  },
  poiDistance: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedTag: {
    backgroundColor: '#E3F2FD',
  },
  tagText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedTagText: {
    color: '#1976D2',
  },
}); 