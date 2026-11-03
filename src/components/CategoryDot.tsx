import React from 'react';
import { View } from 'react-native';

export default function CategoryDot({ color, size = 10 }: { color: string; size?: number }) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }}
    />
  );
}