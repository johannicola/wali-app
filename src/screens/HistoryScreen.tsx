import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { CATEGORIES, CategoryId, getCategory } from '../constants/categories';
import {
  useTransactions,
  formatMoney,
  Transaction,
} from '../services/TransactionsContext';
import AddTransactionModal from '../components/AddTransactionModal';

type TypeFilter = 'all' | 'expense' | 'income';
const EXPENSE_COLOR = '#FF5252';

export default function HistoryScreen() {
  const { transactions, deleteTransaction } = useTransactions();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | CategoryId>('all');
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && getCategory(t.categoryId).id !== categoryFilter) return false;
      if (text && !t.title.toLowerCase().includes(text)) return false;
      return true;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  const openEdit = (t: Transaction) => {
    setEditing(t);
    setModalVisible(true);
  };

  const confirmDelete = (t: Transaction) => {
    Alert.alert('Eliminar', `¿Borrar "${t.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => deleteTransaction(t.id) },
    ]);
  };

  const typeOptions: { id: TypeFilter; label: string }[] = [
    { id: 'all', label: 'Todo' },
    { id: 'expense', label: 'Gastos' },
    { id: 'income', label: 'Ingresos' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Historial</Text>

      {/* Filtros */}
      <View style={styles.filters}>
        <TextInput
          style={styles.search}
          placeholder="Buscar por descripción..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.row}>
          {typeOptions.map((o) => (
            <Pressable
              key={o.id}
              onPress={() => setTypeFilter(o.id)}
              style={[styles.chip, typeFilter === o.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, typeFilter === o.id && styles.chipTextActive]}>
                {o.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          <Pressable
            onPress={() => setCategoryFilter('all')}
            style={[styles.chip, categoryFilter === 'all' && styles.chipActive]}
          >
            <Text style={[styles.chipText, categoryFilter === 'all' && styles.chipTextActive]}>
              Todas
            </Text>
          </Pressable>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setCategoryFilter(c.id)}
              style={[styles.chip, categoryFilter === c.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, categoryFilter === c.id && styles.chipTextActive]}>
                {c.emoji} {c.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.hint}>
        {filtered.length} resultado{filtered.length === 1 ? '' : 's'} · Toca para editar, mantén para borrar
      </Text>

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 10 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.empty}>
            {transactions.length === 0 ? 'Aún no hay transacciones' : 'Nada coincide con los filtros'}
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => openEdit(item)}
            onLongPress={() => confirmDelete(item)}
          >
            <View>
              <Text style={styles.cardTitle}>
                {item.type === 'expense' ? `${getCategory(item.categoryId).emoji} ` : ' '}
                {item.title}
              </Text>
              <Text style={styles.cardDate}>
                {new Date(item.date).toLocaleDateString('es', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <Text
              style={[
                styles.amount,
                { color: item.type === 'income' ? colors.primary : EXPENSE_COLOR },
              ]}
            >
              {item.type === 'income' ? '+' : '-'}
              {formatMoney(item.amountCents)}
            </Text>
          </Pressable>
        )}
      />

      <AddTransactionModal
        visible={modalVisible}
        editing={editing}
        onClose={() => {
          setModalVisible(false);
          setEditing(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 24, fontWeight: 'bold', padding: 20, paddingBottom: 12 },
  filters: { paddingHorizontal: 16, gap: 10 },
  search: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.background },
  hint: { color: colors.textMuted, fontSize: 12, paddingHorizontal: 16, marginTop: 12 },
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
  cardTitle: { color: colors.text, fontWeight: '600', fontSize: 15 },
  cardDate: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  amount: { fontWeight: '700' },
});