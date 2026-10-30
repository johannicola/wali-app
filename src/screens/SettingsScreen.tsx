import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, Pressable, View, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useBudget } from '../services/BudgetContext';
import { formatMoney } from '../services/TransactionsContext';

export default function SettingsScreen() {
  const { budgetCents, setBudgetCents } = useBudget();
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const number = parseFloat(value.replace(',', '.'));
    if (isNaN(number) || number < 0) return;
    setBudgetCents(Math.round(number * 100));
    setValue('');
    setSaved(true);
    Keyboard.dismiss();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ajustes</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Presupuesto mensual</Text>
        <Text style={styles.current}>
          {budgetCents > 0 ? `Actual: ${formatMoney(budgetCents)}` : 'Aún no definido'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nuevo monto (ej. 800)"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={value}
          onChangeText={setValue}
        />

        <Pressable style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>{saved ? '¡Guardado!' : 'Guardar presupuesto'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  title: { color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  label: { color: colors.text, fontSize: 16, fontWeight: '600' },
  current: { color: colors.textMuted, fontSize: 14 },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: { backgroundColor: colors.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: colors.background, fontWeight: '700' },
});