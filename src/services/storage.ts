import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Transaction } from './TransactionsContext';

const KEY = 'wali:transactions';

export async function loadTransactions(): Promise<Transaction[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Transaction[]) : [];
  } catch {
    return [];
  }
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(transactions));
  } catch (e) {
    console.warn('No se pudo guardar', e);
  }
}