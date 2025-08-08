import { Tabs } from 'expo-router';
import React from 'react';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useBottomSheet } from '@/contexts/BottomSheetContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isExpanded } = useBottomSheet();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: { 
          display: isExpanded ? 'flex' : 'none',
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent navigation when bottom sheet is collapsed
            if (!isExpanded) {
              e.preventDefault();
            }
          },
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="magnifyingglass" color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent navigation when bottom sheet is collapsed
            if (!isExpanded) {
              e.preventDefault();
            }
          },
        }}
      />
    </Tabs>
  );
}
