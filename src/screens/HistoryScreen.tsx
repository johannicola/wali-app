import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
});