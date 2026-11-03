import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
  ScrollView,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { Category, COLOR_OPTIONS, FALLBACK_ID } from '../constants/categories';
import { useCategories } from '../services/CategoriesContext';
import { useTransactions } from '../services/TransactionsContext';
import { useBudget } from '../services/BudgetContext';
import { useRecurring } from '../services/RecurringContext';
import CategoryDot from '../components/CategoryDot';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default function CategoriesScreen() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { transactions } = useTransactions();
  const { categoryBudgets, setCategoryBudgets } = useBudget();
  const { items: recurring } = useRecurring();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [error, setError] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setLabel('');
    setColor(COLOR_OPTIONS[0]);
    setError('');
  };

  const startEdit = (c: Category) => {
    setEditingId(c.id);
    setLabel(c.label);
    setColor(c.color);
    setError('');
  };

  const handleSave = () => {
    const problem = editingId
      ? updateCategory(editingId, label, color)
      : addCategory(label, color);
    if (problem) {
      setError(problem);
      return;
    }
    resetForm();
    Keyboard.dismiss();
  };

  const confirmDelete = (c: Category) => {
    const txCount = transactions.filter((t) => t.categoryId === c.id).length;
    const recCount = recurring.filter((r) => r.categoryId === c.id).length;
    const hasLimit = (categoryBudgets[c.id] ?? 0) > 0;

    let message = `Se eliminará "${c.label}".`;
    if (txCount > 0) {
      message += `\n- ${plural(txCount, 'transacción pasará', 'transacciones pasarán')} a "Otros".`;
    }
    if (recCount > 0) {
      message += `\n- ${plural(recCount, 'gasto recurrente pasará', 'gastos recurrentes pasarán')} a "Otros".`;
    }
    if (hasLimit) message += '\n- Su límite de presupuesto se quitará.';

    Alert.alert('Eliminar categoría', message, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteCategory(c.id);
          if (hasLimit) {
            const next = { ...categoryBudgets };
            delete next[c.id];
            setCategoryBudgets(next);
          }
          if (editingId === c.id) resetForm();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Formulario */}
        <View style={styles.card}>
          <Text style={styles.label}>{editingId ? 'Editar categoría' : 'Nueva categoría'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre (ej. Mascotas)"
            placeholderTextColor={colors.textMuted}
            value={label}
            maxLength={20}
            onChangeText={(v) => {
              setLabel(v);
              setError('');
            }}
          />

          <Text style={styles.hint}>Color</Text>
          <View style={styles.swatches}>
            {COLOR_OPTIONS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[styles.swatchRing, color === c && styles.swatchRingActive]}
              >
                <View style={[styles.swatch, { backgroundColor: c }]} />
              </Pressable>
            ))}
          </View>

          {error !== '' && <Text style={styles.error}>{error}</Text>}

          <Pressable style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>
              {editingId ? 'Guardar cambios' : 'Agregar categoría'}
            </Text>
          </Pressable>
          {editingId && (
            <Pressable onPress={resetForm} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancelar edición</Text>
            </Pressable>
          )}
        </View>

        {/* Lista */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.label}>Tus categorías</Text>

          {categories.map((c) => {
            const count = transactions.filter((t) => t.categoryId === c.id).length;
            const isFallback = c.id === FALLBACK_ID;
            return (
              <View key={c.id} style={styles.item}>
                <CategoryDot color={c.color} size={14} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{c.label}</Text>
                  <Text style={styles.itemSub}>
                    {plural(count, 'transacción', 'transacciones')}
                    {isFallback ? ' · fija, recibe las de categorías eliminadas' : ''}
                  </Text>
                </View>
                <Pressable onPress={() => startEdit(c)} hitSlop={8}>
                  <Text style={styles.edit}>Editar</Text>
                </Pressable>
                {!isFallback && (
                  <Pressable onPress={() => confirmDelete(c)} hitSlop={8}>
                    <Text style={styles.delete}>Eliminar</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  label: { color: colors.text, fontSize: 16, fontWeight: '600' },
  hint: { color: colors.textMuted, fontSize: 12 },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatchRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchRingActive: { borderColor: colors.text },
  swatch: { width: 28, height: 28, borderRadius: 14 },
  error: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  button: { backgroundColor: colors.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: colors.background, fontWeight: '700' },
  cancel: { alignItems: 'center', padding: 6 },
  cancelText: { color: colors.textMuted },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemTitle: { color: colors.text, fontWeight: '600' },
  itemSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  edit: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  delete: { color: colors.danger, fontSize: 13, fontWeight: '600' },
});