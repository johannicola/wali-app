// src/screens/DashboardScreen.tsx
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* Cabecera / Saludo */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, Johan 👋</Text>
          <Text style={styles.subtitle}>Bienvenido a WALI</Text>
        </View>

        {/* Tarjeta de Balance General */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Total Disponible</Text>
          <Text style={styles.balanceAmount}>$4,250.00</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>+12.5% este mes</Text>
          </View>
        </View>

        {/* Sección de Transacciones Recientes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimas Transacciones</Text>
        </View>

        <View style={styles.transactionItem}>
          <View>
            <Text style={styles.transactionTitle}>Supermercado</Text>
            <Text style={styles.transactionDate}>Hoy, 04:15 PM</Text>
          </View>
          <Text style={styles.transactionAmountNegative}>-$85.50</Text>
        </View>

        <View style={styles.transactionItem}>
          <View>
            <Text style={styles.transactionTitle}>Depósito Nómina</Text>
            <Text style={styles.transactionDate}>Ayer, 09:00 AM</Text>
          </View>
          <Text style={styles.transactionAmountPositive}>+$1,500.00</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  balanceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  transactionTitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  transactionAmountNegative: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5252',
  },
  transactionAmountPositive: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
});