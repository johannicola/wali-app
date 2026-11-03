// src/screens/DashboardScreen.tsx
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useCategories } from '../services/CategoriesContext';
import { useTransactions, formatMoney } from '../services/TransactionsContext';
import { useBudget } from '../services/BudgetContext';
import AddTransactionModal from '../components/AddTransactionModal';
import BudgetProgress from '../components/BudgetProgress';
import MonthComparison from '../components/MonthComparison';
import CategoryDot from '../components/CategoryDot';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const time = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === today.toDateString()) return `Hoy, ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Ayer, ${time}`;
  return `${d.toLocaleDateString('es', { day: 'numeric', month: 'short' })}, ${time}`;
};

export default function DashboardScreen() {
  const { transactions } = useTransactions();
  const { getCategory } = useCategories();
  const { categoryBudgets } = useBudget();
  const [modalVisible, setModalVisible] = useState(false);

  const { monthExpense, monthIncome, byCategory } = useMemo(() => {
    const now = new Date();
    let expense = 0;
    let income = 0;
    const totals: Record<string, number> = {};

    transactions.forEach((t) => {
      const d = new Date(t.date);
      const isThisMonth =
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (!isThisMonth) return;

      if (t.type === 'income') {
        income += t.amountCents;
      } else {
        expense += t.amountCents;
        const id = getCategory(t.categoryId).id;
        totals[id] = (totals[id] ?? 0) + t.amountCents;
      }
    });

    const list = Object.entries(totals)
      .map(([id, cents]) => ({ category: getCategory(id), cents }))
      .sort((a, b) => b.cents - a.cents);

    return { monthExpense: expense, monthIncome: income, byCategory: list };
  }, [transactions, getCategory]);

  const remaining = monthIncome - monthExpense;
  const recent = transactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, Johan</Text>
          <Text style={styles.subtitle}>Bienvenido a WALI</Text>
        </View>

        {/* Tarjeta principal: gastado este mes */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Gastado este mes</Text>
          <Text style={styles.balanceAmount}>{formatMoney(monthExpense)}</Text>

          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Ingresos del mes</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                {formatMoney(monthIncome)}
              </Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Te quedan</Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: remaining >= 0 ? colors.text : colors.danger },
                ]}
              >
                {remaining < 0 ? '-' : ''}
                {formatMoney(Math.abs(remaining))}
              </Text>
            </View>
          </View>
        </View>

        <BudgetProgress spentCents={monthExpense} />

        <MonthComparison />

        {/* Gastos por categoría */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>En qué gastas</Text>
        </View>
        {byCategory.length === 0 ? (
          <Text style={styles.empty}>Aún no hay gastos este mes.</Text>
        ) : (
          <View style={styles.categoryCard}>
            {byCategory.map(({ category, cents }) => {
              const pct = monthExpense > 0 ? Math.round((cents / monthExpense) * 100) : 0;
              const limit = categoryBudgets[category.id] ?? 0;
              const hasLimit = limit > 0;
              const ratio = hasLimit ? cents / limit : 0;

              const barPct = hasLimit ? Math.min(Math.round(ratio * 100), 100) : pct;
              const barColor = !hasLimit
                ? category.color
                : ratio >= 1
                ? colors.danger
                : ratio >= 0.8
                ? colors.warning
                : category.color;

              return (
                <View key={category.id} style={styles.categoryRow}>
                  <View style={styles.categoryTop}>
                    <View style={styles.categoryNameRow}>
                      <CategoryDot color={category.color} />
                      <Text style={styles.categoryName}>{category.label}</Text>
                    </View>
                    <Text
                      style={[
                        styles.categoryAmount,
                        hasLimit && ratio >= 0.8 && { color: barColor },
                      ]}
                    >
                      {hasLimit
                        ? `${formatMoney(cents)} / ${formatMoney(limit)}`
                        : `${formatMoney(cents)} · ${pct}%`}
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[styles.barFill, { width: `${barPct}%`, backgroundColor: barColor }]}
                    />
                  </View>
                  {hasLimit && ratio >= 1 && (
                    <Text style={styles.overText}>
                      Te pasaste por {formatMoney(cents - limit)}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Últimas transacciones */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Últimas Transacciones</Text>
        </View>
        {recent.length === 0 ? (
          <Text style={styles.empty}>Toca + para agregar la primera.</Text>
        ) : (
          recent.map((t) => (
            <View key={t.id} style={styles.transactionItem}>
              <View style={{ flex: 1 }}>
                <View style={styles.categoryNameRow}>
                  <CategoryDot
                    color={t.type === 'expense' ? getCategory(t.categoryId).color : colors.primary}
                  />
                  <Text style={styles.transactionTitle} numberOfLines={1}>
                    {t.title}
                  </Text>
                </View>
                <Text style={styles.transactionDate}>{formatDate(t.date)}</Text>
              </View>
              <Text
                style={
                  t.type === 'income'
                    ? styles.transactionAmountPositive
                    : styles.transactionAmountNegative
                }
              >
                {t.type === 'income' ? '+' : '-'}
                {formatMoney(t.amountCents)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <AddTransactionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },

  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  balanceLabel: { fontSize: 14, color: colors.textMuted, marginBottom: 8 },
  balanceAmount: { fontSize: 32, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  summaryLabel: { fontSize: 12, color: colors.textMuted },
  summaryValue: { fontSize: 16, fontWeight: '700', marginTop: 2 },

  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  empty: { color: colors.textMuted, fontSize: 14 },

  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  categoryRow: { gap: 6 },
  categoryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryName: { color: colors.text, fontWeight: '600' },
  categoryAmount: { color: colors.textMuted, fontSize: 13 },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 4 },
  overText: { color: colors.danger, fontSize: 12, fontWeight: '600' },

  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  transactionTitle: { fontSize: 16, color: colors.text, fontWeight: '500', flexShrink: 1 },
  transactionDate: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  transactionAmountNegative: { fontSize: 16, fontWeight: '600', color: colors.danger },
  transactionAmountPositive: { fontSize: 16, fontWeight: '600', color: colors.primary },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: colors.background, fontSize: 32, fontWeight: '700', marginTop: -2 },
});