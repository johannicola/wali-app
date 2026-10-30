import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { loadTransactions, saveTransactions } from './storage';
import type { CategoryId } from '../constants/categories';

export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  title: string;
  amountCents: number;
  type: TransactionType;
  categoryId?: CategoryId;
  date: string;
};

type NewTransaction = Omit<Transaction, 'id' | 'date'>;

type ContextValue = {
  transactions: Transaction[];
  balanceCents: number;
  addTransaction: (t: NewTransaction) => void;
  deleteTransaction: (id: string) => void;
};

const TransactionsContext = createContext<ContextValue | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadTransactions().then((data) => {
      setTransactions(data);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveTransactions(transactions);
  }, [transactions, loaded]);

  const addTransaction = (t: NewTransaction) => {
    const newItem: Transaction = {
      ...t,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [newItem, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const balanceCents = useMemo(
    () =>
      transactions.reduce(
        (sum, t) => (t.type === 'income' ? sum + t.amountCents : sum - t.amountCents),
        0
      ),
    [transactions]
  );

  return (
    <TransactionsContext.Provider
      value={{ transactions, balanceCents, addTransaction, deleteTransaction }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) throw new Error('useTransactions debe usarse dentro de TransactionsProvider');
  return ctx;
}

export const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;