import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { CategoryId } from '../constants/categories';
import { useCategories } from '../services/CategoriesContext';
import { useBudget } from '../services/BudgetContext';
import { formatMoney } from '../services/TransactionsContext';
import CategoryDot from '../components/CategoryDot';

const toCents = (text: string) => {
  const n = parseFloat((text ?? '').replace(',', '.'));
  return isNaN(n) || n <= 0 ? 0 : Math.round(n * 100);
};

export default function BudgetScreen() {
  const { categories } = useCategories();
  const { budgetCents, setBudgetCents, categoryBudgets, setCategoryBudgets } = useBudget();

  const [total, setTotal] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savedTotal, setSavedTotal] = useState(false);
  const [savedCats, setSavedCats] = useState(false);
  const [totalError, setTotalError] = useState('');
  const [catError, setCatError] = useState('');

  useEffect(() => {
    const next: Record<string, string> = {};
    categories.forEach((c) => {
      const cents = categoryBudgets[c.id];
      next[c.id] = cents ? (cents / 100).toString() : '';
    });
    setDrafts(next);
  }, [categoryBudgets, categories]);

  const assignedCents = useMemo(
    () => categories.reduce((sum, c) => sum + toCents(drafts[c.id] ?? ''), 0),
    [drafts, categories]
  );

  // Solo cuenta límites de categorías que existen
  const savedAssignedCents = useMemo(
    () => categories.reduce((sum, c) => sum + (categoryBudgets[c.id] ?? 0), 0),
    [categoryBudgets, categories]
  );

  const availableCents = budgetCents - assignedCents;
  const exceeds = assignedCents > budgetCents;

  const saveTotal = () => {
    const newTotal = toCents(total);
    if (newTotal === 0 && total.trim() !== '0') {
      setTotalError('Escribe un monto válido.');
      return;
    }
    if (newTotal < savedAssignedCents) {
      setTotalError(
        `Ya repartiste ${formatMoney(savedAssignedCents)} entre categorías. ` +
          `El total no puede ser menor: baja primero esos límites.`
      );
      return;
    }
    setTotalError('');
    setBudgetCents(newTotal);
    setTotal('');
    setSavedTotal(true);
    Keyboard.dismiss();
    setTimeout(() => setSavedTotal(false), 2000);
  };

  const saveCategories = () => {
    if (assignedCents > 0 && budgetCents <= 0) {
      setCatError('Define primero el presupuesto mensual total.');
      return;
    }
    if (assignedCents > budgetCents) {
      setCatError(
        `Los límites suman ${formatMoney(assignedCents)} y superan tu presupuesto ` +
          `de ${formatMoney(budgetCents)} por ${formatMoney(assignedCents - budgetCents)}.`
      );
      return;
    }

    const result: Partial<Record<CategoryId, number>> = {};
    categories.forEach((c) => {
      const cents = toCents(drafts[c.id] ?? '');
      if (cents > 0) result[c.id] = cents;
    });

    setCatError('');
    setCategoryBudgets(result);
    setSavedCats(true);
    Keyboard.dismiss();
    setTimeout(() => setSavedCats(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Presupuesto total */}
        <View style={styles.card}>
          <Text style={styles.label}>Presupuesto mensual total</Text>
          <Text style={styles.current}>
            {budgetCents > 0 ? `Actual: ${formatMoney(budgetCents)}` : 'Aún no definido'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nuevo monto (ej. 800)"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={total}
            onChangeText={(v) => {
              setTotal(v);
              setTotalError('');
            }}
          />
          {totalError !== '' && <Text style={styles.error}>{totalError}</Text>}
          <Pressable style={styles.button} onPress={saveTotal}>
            <Text style={styles.buttonText}>
              {savedTotal ? 'Guardado' : 'Guardar presupuesto'}
            </Text>
          </Pressable>
        </View>

        {/* Límites por categoría */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.label}>Límite por categoría</Text>
          <Text style={styles.current}>
            Déjalo vacío si no quieres límite. La suma no puede superar tu presupuesto total.
          </Text>

          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              Asignado: {formatMoney(assignedCents)} de {formatMoney(budgetCents)}
            </Text>
            <Text
              style={[styles.summaryText, { color: exceeds ? colors.danger : colors.primary }]}
            >
              {exceeds
                ? `Te pasas por ${formatMoney(assignedCents - budgetCents)}`
                : `Disponible: ${formatMoney(availableCents)}`}
            </Text>
          </View>

          {categories.map((c) => (
            <View key={c.id} style={styles.catRow}>
              <View style={styles.catLabel}>
                <CategoryDot color={c.color} />
                <Text style={styles.catName} numberOfLines={1}>
                  {c.label}
                </Text>
              </View>
              <TextInput
                style={[styles.input, styles.catInput, exceeds && styles.inputError]}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={drafts[c.id] ?? ''}
                onChangeText={(v) => {
                  setDrafts((d) => ({ ...d, [c.id]: v }));
                  setCatError('');
                }}
              />
            </View>
          ))}

          {catError !== '' && <Text style={styles.error}>{catError}</Text>}

          <Pressable
            style={[styles.button, exceeds && styles.buttonDisabled]}
            onPress={saveCategories}
          >
            <Text style={styles.buttonText}>{savedCats ? 'Guardado' : 'Guardar límites'}</Text>
          </Pressable>
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
  current: { color: colors.textMuted, fontSize: 13 },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: { borderColor: colors.danger },
  summary: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  catRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  catLabel: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  catName: { color: colors.text, fontSize: 15, flexShrink: 1 },
  catInput: { width: 120, paddingVertical: 10, textAlign: 'right' },
  error: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  button: { backgroundColor: colors.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: colors.background, fontWeight: '700' },
});