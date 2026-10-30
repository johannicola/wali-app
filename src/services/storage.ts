import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Transaction } from './TransactionsContext';

const TRANSACTIONS_KEY = 'wali:transactions';
const BUDGET_KEY = 'wali:monthlyBudgetCents';

export async function loadTransactions(): Promise<Transaction[]> {
  try {
    const raw = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return raw ? (JSON.parse(raw) as Transaction[]) : [];
  } catch {
    return [];
  }
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  try {
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.warn('No se pudo guardar', e);
  }
}

export async function loadBudget(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(BUDGET_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

export async function saveBudget(cents: number): Promise<void> {
  try {
    await AsyncStorage.setItem(BUDGET_KEY, String(cents));
  } catch (e) {
    console.warn('No se pudo guardar el presupuesto', e);
  }
}