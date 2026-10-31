import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors } from '../constants/colors';
import { CATEGORIES, CategoryId } from '../constants/categories';
import {
  useTransactions,
  Transaction,
  TransactionType,
} from '../services/TransactionsContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  editing?: Transaction | null;
};

// --- Ayudas de fecha ---
const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const shiftDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const shiftMonths = (d: Date, n: number) => {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d.getDate(), lastDay)); // evita saltar al mes siguiente (31 → 30)
  target.setHours(d.getHours(), d.getMinutes(), 0, 0);
  return target;
};

// Nunca permitir fechas futuras
const clampToToday = (d: Date) => {
  const now = new Date();
  return d.getTime() > now.getTime() ? now : d;
};

export default function AddTransactionModal({ visible, onClose, editing }: Props) {
  const { addTransaction, updateTransaction } = useTransactions();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState<CategoryId>('food');
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setTitle(editing.title);
      setAmount((editing.amountCents / 100).toFixed(2));
      setType(editing.type);
      setCategoryId(editing.categoryId ?? 'other');
      setDate(new Date(editing.date));
    } else {
      setTitle('');
      setAmount('');
      setType('expense');
      setCategoryId('food');
      setDate(new Date());
    }
  }, [visible, editing]);

  const today = new Date();
  const yesterday = shiftDays(today, -1);
  const dateLabel = date.toLocaleDateString('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleSave = () => {
    const value = parseFloat(amount.replace(',', '.'));
    if (!title.trim() || isNaN(value) || value <= 0) return;

    const data = {
      title: title.trim(),
      amountCents: Math.round(value * 100),
      type,
      categoryId: type === 'expense' ? categoryId : undefined,
      date: date.toISOString(),
    };

    if (editing) updateTransaction(editing.id, data);
    else addTransaction(data);

    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 12 }}>
            <Text style={styles.heading}>
              {editing ? 'Editar transacción' : 'Nueva transacción'}
            </Text>

            <View style={styles.toggleRow}>
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
              placeholder="Descripción (ej. Almuerzo)"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Monto"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />

            {/* Fecha */}
            <View>
              <Text style={styles.label}>Fecha</Text>

              <View style={styles.chips}>
                <Pressable
                  onPress={() => setDate(new Date())}
                  style={[styles.chip, isSameDay(date, today) && styles.chipActive]}
                >
                  <Text style={[styles.chipText, isSameDay(date, today) && styles.chipTextActive]}>
                    Hoy
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setDate(yesterday)}
                  style={[styles.chip, isSameDay(date, yesterday) && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, isSameDay(date, yesterday) && styles.chipTextActive]}
                  >
                    Ayer
                  </Text>
                </Pressable>
              </View>

              <View style={styles.stepper}>
                <Pressable style={styles.stepBtn} onPress={() => setDate(shiftMonths(date, -1))}>
                  <Text style={styles.stepText}>«</Text>
                </Pressable>
                <Pressable style={styles.stepBtn} onPress={() => setDate(shiftDays(date, -1))}>
                  <Text style={styles.stepText}>‹</Text>
                </Pressable>

                <Text style={styles.dateLabel}>{dateLabel}</Text>

                <Pressable
                  style={styles.stepBtn}
                  onPress={() => setDate(clampToToday(shiftDays(date, 1)))}
                >
                  <Text style={styles.stepText}>›</Text>
                </Pressable>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => setDate(clampToToday(shiftMonths(date, 1)))}
                >
                  <Text style={styles.stepText}>»</Text>
                </Pressable>
              </View>
              <Text style={styles.stepHint}>‹ › mueven un día · « » mueven un mes</Text>
            </View>

            {type === 'expense' && (
              <View>
                <Text style={styles.label}>Categoría</Text>
                <View style={styles.chips}>
                  {CATEGORIES.map((c) => (
                    <Pressable
                      key={c.id}
                      onPress={() => setCategoryId(c.id)}
                      style={[styles.chip, categoryId === c.id && styles.chipActive]}
                    >
                      <Text
                        style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}
                      >
                        {c.emoji} {c.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>{editing ? 'Guardar cambios' : 'Guardar'}</Text>
            </Pressable>
            <Pressable onPress={onClose} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  heading: { color: colors.text, fontSize: 18, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggle: {
    flex: 1,
    padding: 12,
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
  label: { color: colors.textMuted, fontSize: 12, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.background },
  stepper: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: -2 },
  dateLabel: {
    flex: 1,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  stepHint: { color: colors.textMuted, fontSize: 11, marginTop: 6 },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: { color: colors.background, fontWeight: '700' },
  cancel: { alignItems: 'center', padding: 8 },
  cancelText: { color: colors.textMuted },
});