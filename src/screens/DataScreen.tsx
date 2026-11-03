import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, Pressable, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useCategories } from '../services/CategoriesContext';
import { useTransactions, Transaction } from '../services/TransactionsContext';
import { buildCsv, shareCsv } from '../services/exportCsv';

type Range = 'all' | 'month' | 'lastMonth';

const RANGES: { id: Range; label: string }[] = [
  { id: 'all', label: 'Todo el historial' },
  { id: 'month', label: 'Este mes' },
  { id: 'lastMonth', label: 'Mes pasado' },
];

const inRange = (t: Transaction, range: Range) => {
  if (range === 'all') return true;
  const now = new Date();
  const ref =
    range === 'month' ? now : new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const d = new Date(t.date);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
};

export default function DataScreen() {
  const { transactions } = useTransactions();
  const { getCategory } = useCategories();
  const [range, setRange] = useState<Range>('all');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);

  const selected = useMemo(
    () => transactions.filter((t) => inRange(t, range)),
    [transactions, range]
  );

  const handleExport = async () => {
    if (selected.length === 0) {
      setIsError(true);
      setStatus('No hay transacciones en ese período.');
      return;
    }

    setBusy(true);
    setStatus('');
    try {
      // Del más antiguo al más reciente, más cómodo para revisar en Excel
      const ordered = [...selected].reverse();
      const result = await shareCsv(buildCsv(ordered, getCategory));

      setIsError(result === 'unavailable');
      setStatus(
        result === 'downloaded'
          ? 'Archivo descargado.'
          : result === 'shared'
          ? 'Listo. Elige dónde guardarlo o a quién enviarlo.'
          : 'Este dispositivo no permite compartir archivos.'
      );
    } catch (e) {
      console.warn('Error al exportar', e);
      setIsError(true);
      setStatus('No se pudo crear el archivo. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Exportar a CSV</Text>
          <Text style={styles.hint}>
            Genera un archivo con tus gastos e ingresos que puedes abrir en Excel o Google Sheets.
            También sirve como respaldo de tus datos.
          </Text>

          <Text style={styles.sub}>Período</Text>
          <View style={styles.chips}>
            {RANGES.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => {
                  setRange(r.id);
                  setStatus('');
                }}
                style={[styles.chip, range === r.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, range === r.id && styles.chipTextActive]}>
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.count}>
            {selected.length} {selected.length === 1 ? 'transacción' : 'transacciones'} en el
            archivo
          </Text>

          {status !== '' && (
            <Text style={[styles.status, isError && { color: colors.danger }]}>{status}</Text>
          )}

          <Pressable
            style={[styles.button, busy && styles.buttonDisabled]}
            onPress={handleExport}
            disabled={busy}
          >
            <Text style={styles.buttonText}>{busy ? 'Generando...' : 'Exportar'}</Text>
          </Pressable>
        </View>

        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={styles.label}>Qué contiene el archivo</Text>
          <Text style={styles.hint}>
            Columnas: Fecha, Tipo, Descripción, Categoría y Monto. Los gastos aparecen en negativo
            y los ingresos en positivo, así que la suma de la columna Monto es tu saldo.
          </Text>
          <Text style={styles.hint}>
            Si Excel muestra todo en una sola columna, usa Datos, luego Desde texto o CSV, y elige
            la coma como separador.
          </Text>
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
  sub: { color: colors.textMuted, fontSize: 12 },
  hint: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.background },
  count: { color: colors.text, fontSize: 14, fontWeight: '600' },
  status: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  button: { backgroundColor: colors.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.background, fontWeight: '700' },
});