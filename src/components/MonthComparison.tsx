import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { useTransactions, formatMoney } from '../services/TransactionsContext';

const DANGER = '#FF5252';
const CHART_HEIGHT = 90;

export default function MonthComparison() {
  const { transactions } = useTransactions();

  const { months, current, previous } = useMemo(() => {
    const now = new Date();

    // Los últimos 6 meses, del más antiguo al actual
    const list: { year: number; month: number; label: string; cents: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleDateString('es', { month: 'short' }).replace('.', ''),
        cents: 0,
      });
    }

    // Sumar los gastos de cada mes
    transactions.forEach((t) => {
      if (t.type !== 'expense') return;
      const d = new Date(t.date);
      const m = list.find((x) => x.year === d.getFullYear() && x.month === d.getMonth());
      if (m) m.cents += t.amountCents;
    });

    return { months: list, current: list[5].cents, previous: list[4].cents };
  }, [transactions]);

  const maxCents = Math.max(...months.map((m) => m.cents), 1);

  // Texto de comparación
  let message = 'Aún no hay gastos del mes anterior para comparar.';
  let messageColor: string = colors.textMuted;

  if (previous > 0) {
    const diff = Math.round(((current - previous) / previous) * 100);
    if (diff > 0) {
      message = `↑ ${diff}% más que el mes pasado`;
      messageColor = DANGER;
    } else if (diff < 0) {
      message = `↓ ${Math.abs(diff)}% menos que el mes pasado`;
      messageColor = colors.primary;
    } else {
      message = 'Igual que el mes pasado';
      messageColor = colors.text;
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Comparación mensual</Text>
      <Text style={[styles.message, { color: messageColor }]}>{message}</Text>
      {previous > 0 && (
        <Text style={styles.detail}>
          {formatMoney(current)} este mes · {formatMoney(previous)} el mes pasado
        </Text>
      )}

      <View style={styles.chart}>
        {months.map((m, index) => {
          const isCurrent = index === months.length - 1;
          const height = m.cents > 0 ? Math.max((m.cents / maxCents) * CHART_HEIGHT, 4) : 2;
          return (
            <View key={`${m.year}-${m.month}`} style={styles.column}>
              <View style={styles.barArea}>
                <View
                  style={[
                    styles.bar,
                    { height, backgroundColor: isCurrent ? colors.primary : colors.border },
                  ]}
                />
              </View>
              <Text style={[styles.monthLabel, isCurrent && { color: colors.text }]}>
                {m.label}
              </Text>
            </View>
          );
        })}
      </View>
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
    gap: 6,
  },
  title: { color: colors.text, fontSize: 16, fontWeight: '600' },
  message: { fontSize: 15, fontWeight: '700' },
  detail: { color: colors.textMuted, fontSize: 12 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 8 },
  column: { flex: 1, alignItems: 'center', gap: 6 },
  barArea: { height: CHART_HEIGHT, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '70%', borderRadius: 6 },
  monthLabel: { color: colors.textMuted, fontSize: 11, textTransform: 'capitalize' },
});