import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { useBudget } from '../services/BudgetContext';
import { formatMoney } from '../services/TransactionsContext';

const WARNING = '#FFB020';
const DANGER = '#FF5252';

export default function BudgetProgress({ spentCents }: { spentCents: number }) {
  const { budgetCents } = useBudget();

  if (budgetCents <= 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Presupuesto mensual</Text>
        <Text style={styles.hint}>Define cuánto quieres gastar al mes en la pestaña Ajustes.</Text>
      </View>
    );
  }

  const ratio = spentCents / budgetCents;
  const pct = Math.round(ratio * 100);
  const barColor = ratio >= 1 ? DANGER : ratio >= 0.8 ? WARNING : colors.primary;
  const leftCents = budgetCents - spentCents;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>Presupuesto mensual</Text>
        <Text style={[styles.pct, { color: barColor }]}>{pct}%</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }]} />
      </View>

      <Text style={styles.detail}>
        {formatMoney(spentCents)} de {formatMoney(budgetCents)}
      </Text>
      <Text style={[styles.status, { color: barColor }]}>
        {leftCents >= 0
          ? `Te quedan ${formatMoney(leftCents)}`
          : `Te pasaste por ${formatMoney(Math.abs(leftCents))}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    gap: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: colors.text, fontSize: 16, fontWeight: '600' },
  pct: { fontSize: 16, fontWeight: '700' },
  hint: { color: colors.textMuted, fontSize: 14 },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.background, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
  detail: { color: colors.textMuted, fontSize: 13 },
  status: { fontSize: 14, fontWeight: '600' },
});