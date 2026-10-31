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
  recurringId?: string; // si vino de un gasto recurrente
  date: string; // ISO
};

type NewTransaction = Omit<Transaction, 'id' | 'date'> & { date?: string };

type ContextValue = {
  transactions: Transaction[];
  loaded: boolean;
  balanceCents: number;
  addTransaction: (t: NewTransaction) => void;
  updateTransaction: (id: string, changes: NewTransaction) => void;
  deleteTransaction: (id: string) => void;
};

const TransactionsContext = createContext<ContextValue | undefined>(undefined);

const sortByDate = (list: Transaction[]) =>
  [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadTransactions().then((data) => {
      setTransactions(sortByDate(data));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveTransactions(transactions);
  }, [transactions, loaded]);

  const addTransaction = (t: NewTransaction) => {
    const newItem: Transaction = {
      ...t,
      id: newId(),
      date: t.date ?? new Date().toISOString(),
    };
    setTransactions((prev) => sortByDate([newItem, ...prev]));
  };

  const updateTransaction = (id: string, changes: NewTransaction) => {
    setTransactions((prev) =>
      sortByDate(
        prev.map((t) =>
          t.id === id ? { ...t, ...changes, date: changes.date ?? t.date } : t
        )
      )
    );
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
      value={{
        transactions,
        loaded,
        balanceCents,
        addTransaction,
        updateTransaction,
        deleteTransaction,
      }}
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