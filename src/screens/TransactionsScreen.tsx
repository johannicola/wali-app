import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';

export default function TransactionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Historial de Transacciones</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
});