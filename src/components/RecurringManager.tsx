import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, Keyboard, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { CategoryId, FALLBACK_ID } from '../constants/categories';
import { useCategories } from '../services/CategoriesContext';
import { useRecurring } from '../services/RecurringContext';
import { formatMoney, TransactionType } from '../services/TransactionsContext';
import CategoryDot from './CategoryDot';

export default function RecurringManager() {
  const { categories, getCategory } = useCategories();
  const { items, addRecurring, deleteRecurring } = useRecurring();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState<CategoryId>('home');
  const [error, setError] = useState('');

  // Si la categoría elegida ya no existe, se usa "Otros"
  const effectiveCategory = categories.some((c) => c.id === categoryId) ? categoryId : FALLBACK_ID;

  const handleAdd = () => {
    const value = parseFloat(amount.replace(',', '.'));
    const dayNumber = parseInt(day, 10);

    if (!title.trim()) return setError('Escribe una descripción.');
    if (isNaN(value) || value <= 0) return setError('Escribe un monto válido.');
    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31)
      return setError('El día debe estar entre 1 y 31.');

    addRecurring({
      title: title.trim(),
      amountCents: Math.round(value * 100),
      type,
      categoryId: type === 'expense' ? effectiveCategory : undefined,
      dayOfMonth: dayNumber,
    });

    setTitle('');
    setAmount('');
    setDay('');
    setError('');
    Keyboard.dismiss();
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert(
      'Eliminar recurrente',
      `¿Dejar de registrar "${name}" cada mes? Los que ya se registraron se conservan.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteRecurring(id) },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Gastos recurrentes</Text>
      <Text style={styles.hint}>
        Se registran solos cada mes, el día que elijas (alquiler, internet, suscripciones).
      </Text>

      {items.length === 0 ? (
        <Text style={styles.empty}>Aún no tienes recurrentes.</Text>
      ) : (
        items.map((r) => (
          <View key={r.id} style={styles.item}>
            <View style={{ flex: 1 }}>
              <View style={styles.itemHead}>
                <CategoryDot
                  color={r.type === 'expense' ? getCategory(r.categoryId).color : colors.primary}
                />
                <Text style={styles.itemTitle}>{r.title}</Text>
              </View>
              <Text style={styles.itemSub}>
                {r.type === 'expense' ? '-' : '+'}
                {formatMoney(r.amountCents)} · el día {r.dayOfMonth} de cada mes
              </Text>
            </View>
            <Pressable onPress={() => confirmDelete(r.id, r.title)} hitSlop={10}>
              <Text style={styles.delete}>Eliminar</Text>
            </Pressable>
          </View>
        ))
      )}

      <View style={styles.divider} />
      <Text style={styles.subLabel}>Agregar nuevo</Text>

      <View style={styles.row}>
        {(['expense', 'income'] as TransactionType[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setType(t)}
            style={[styles.toggle, type === t && styles.toggleActive]}
          >
            <Text style={[styles.toggleText, type === t && styles.toggleTextActive]}>
              {t === 'expense' ? 'Gasto' : 'Ingreso'}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Descripción (ej. Alquiler)"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={(v) => {
          setTitle(v);
          setError('');
        }}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Monto"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={(v) => {
            setAmount(v);
            setError('');
          }}
        />
        <TextInput
          style={[styles.input, { width: 110 }]}
          placeholder="Día (1-31)"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          value={day}
          onChangeText={(v) => {
            setDay(v);
            setError('');
          }}
        />
      </View>

      {type === 'expense' && (
        <View style={styles.chips}>
          {categories.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setCategoryId(c.id)}
              style={[styles.chip, effectiveCategory === c.id && styles.chipActive]}
            >
              <CategoryDot color={c.color} size={8} />
              <Text
                style={[styles.chipText, effectiveCategory === c.id && styles.chipTextActive]}
              >
                {c.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {error !== '' && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Agregar recurrente</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  label: { color: colors.text, fontSize: 16, fontWeight: '600' },
  subLabel: { color: colors.text, fontSize: 14, fontWeight: '600' },
  hint: { color: colors.textMuted, fontSize: 13 },
  empty: { color: colors.textMuted, fontSize: 14 },
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
  itemHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemTitle: { color: colors.text, fontWeight: '600' },
  itemSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  delete: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border },
  row: { flexDirection: 'row', gap: 8 },
  toggle: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { color: colors.textMuted, fontWeight: '600' },
  toggleTextActive: { color: colors.background },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.background },
  error: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  button: { backgroundColor: colors.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: colors.background, fontWeight: '700' },
});