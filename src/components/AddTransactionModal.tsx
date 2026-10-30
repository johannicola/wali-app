import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../constants/colors';
import { CATEGORIES, CategoryId } from '../constants/categories';
import { useTransactions, TransactionType } from '../services/TransactionsContext';

type Props = { visible: boolean; onClose: () => void };

export default function AddTransactionModal({ visible, onClose }: Props) {
  const { addTransaction } = useTransactions();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState<CategoryId>('food');

  const reset = () => {
    setTitle('');
    setAmount('');
    setType('expense');
    setCategoryId('food');
  };

  const handleSave = () => {
    const value = parseFloat(amount.replace(',', '.'));
    if (!title.trim() || isNaN(value) || value <= 0) return;
    addTransaction({
      title: title.trim(),
      amountCents: Math.round(value * 100),
      type,
      categoryId: type === 'expense' ? categoryId : undefined,
    });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <Text style={styles.heading}>Nueva transacción</Text>

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
                    <Text style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>
                      {c.emoji} {c.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Guardar</Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
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
    gap: 12,
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