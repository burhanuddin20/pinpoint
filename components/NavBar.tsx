import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';

interface Props {
  visible: boolean;
}

export default function NavBar({ visible }: Props) {
  const translateY = useRef(new Animated.Value(-80)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible ? 0 : -80,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, translateY]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}> 
      <View style={styles.content}>
        <Text style={styles.title}>Pinpoint</Text>
        <TouchableOpacity style={styles.button} activeOpacity={0.7}>
          <Text style={styles.buttonText}>Filter</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.select({ ios: 0, android: 8 }),
    backgroundColor: 'rgba(255,255,255,0.95)',
    zIndex: 10,
    elevation: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e6e6e6',
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#111',
    borderRadius: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});