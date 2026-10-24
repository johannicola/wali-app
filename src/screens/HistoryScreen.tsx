import React from 'react';
import { View, Text, FlatList, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useTransactions, formatMoney } from '../services/TransactionsContext';

export default function HistoryScreen() {
  const { transactions, deleteTransaction } = useTransactions();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Historial</Text>
      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={<Text style={styles.empty}>Aún no hay transacciones</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onLongPress={() =>
              Alert.alert('Eliminar', `¿Borrar "${item.title}"?`, [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Borrar', style: 'destructive', onPress: () => deleteTransaction(item.id) },
              ])
            }
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={[styles.amount, { color: item.type === 'income' ? colors.primary : '#FF5A5F' }]}>
              {item.type === 'income' ? '+' : '-'}{formatMoney(item.amountCents)}
            </Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 20, fontWeight: '700', padding: 16 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.text, fontWeight: '600' },
  amount: { fontWeight: '700' },
});