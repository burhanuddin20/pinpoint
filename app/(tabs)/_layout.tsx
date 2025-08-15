import { Tabs } from 'expo-router';
import React from 'react';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { useBottomSheet } from '@/contexts/BottomSheetContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isExpanded, isHalfway } = useBottomSheet();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#000',
        headerShown: false,
        tabBarStyle: { 
          display: (isExpanded || isHalfway) ? 'flex' : 'none',
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Pinpoint',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color="#000" />,
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent navigation when bottom sheet is collapsed
            if (!isExpanded && !isHalfway) {
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
            if (!isExpanded && !isHalfway) {
              e.preventDefault();
            }
          },
        }}
      />
    </Tabs>
  );
}
