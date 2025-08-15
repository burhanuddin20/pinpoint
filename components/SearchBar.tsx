import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	isSearching: boolean;
	searchError: string | null;
	onSubmit: () => void;
	onBackPress?: () => void;
	poisCount?: number;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  isSearching,
  searchError,
  onSubmit,
  onBackPress,
  poisCount = 0,
}: SearchBarProps) {
  return (
    <View style={styles.headerSearchContainer}>
      <View style={styles.searchRow}>
        {onBackPress && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        )}
        
        <View style={styles.searchBar}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchTitle}>Places in map area</Text>
            <Text style={styles.searchSubtitle}>
              {searchQuery.length > 0 ? `Searching for "${searchQuery}"` : `${poisCount} places found`}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {searchError && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={16} color="#F44336" />
          <Text style={styles.errorText}>{searchError}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerSearchContainer: {
    marginTop: 12,
    marginHorizontal: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInputContainer: {
    flex: 1,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
    textAlign: 'center',
  },
  searchSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
    gap: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
  },
}); 