import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { Transaction } from './TransactionsContext';
import type { Category } from '../constants/categories';

const pad = (n: number) => String(n).padStart(2, '0');

// Entre comillas, y evita que Excel interprete el texto como una fórmula
const cell = (value: string) => {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
};

export function buildCsv(
  transactions: Transaction[],
  getCategory: (id?: string) => Category
): string {
  const header = ['Fecha', 'Tipo', 'Descripción', 'Categoría', 'Monto'];

  const rows = transactions.map((t) => {
    const d = new Date(t.date);
    const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const isExpense = t.type === 'expense';
    const signed = ((isExpense ? -t.amountCents : t.amountCents) / 100).toFixed(2);

    return [
      date,
      isExpense ? 'Gasto' : 'Ingreso',
      cell(t.title),
      isExpense ? cell(getCategory(t.categoryId).label) : '',
      signed,
    ].join(',');
  });

  // El carácter inicial permite que Excel muestre bien las tildes
  return '\uFEFF' + [header.join(','), ...rows].join('\r\n');
}

export type ShareResult = 'shared' | 'downloaded' | 'unavailable';

export async function shareCsv(csv: string): Promise<ShareResult> {
  const now = new Date();
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(
    now.getHours()
  )}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const name = `wali-${stamp}.csv`;

  // En el navegador se descarga directamente
  if (Platform.OS === 'web') {
    const g = globalThis as any;
    const blob = new g.Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = g.URL.createObjectURL(blob);
    const link = g.document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    g.URL.revokeObjectURL(url);
    return 'downloaded';
  }

  // En el celular se crea el archivo y se abre el menú de compartir
  const file = new File(Paths.cache, name);
  file.create();
  file.write(csv);

  if (!(await Sharing.isAvailableAsync())) return 'unavailable';

  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Exportar datos de WALI',
    UTI: 'public.comma-separated-values-text',
  });
  return 'shared';
}