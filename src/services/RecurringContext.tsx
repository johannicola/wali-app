import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import type { CategoryId } from '../constants/categories';
import { loadRecurring, saveRecurring } from './storage';
import { useTransactions, TransactionType } from './TransactionsContext';

export type Recurring = {
  id: string;
  title: string;
  amountCents: number;
  type: TransactionType;
  categoryId?: CategoryId;
  dayOfMonth: number; // 1 a 31
  lastMonthIndex: number; // último mes ya generado (año*12 + mes)
};

export type NewRecurring = Omit<Recurring, 'id' | 'lastMonthIndex'>;

type RecurringValue = {
  items: Recurring[];
  addRecurring: (r: NewRecurring) => void;
  deleteRecurring: (id: string) => void;
};

const RecurringContext = createContext<RecurringValue | undefined>(undefined);

const monthIndex = (d: Date) => d.getFullYear() * 12 + d.getMonth();

export function RecurringProvider({ children }: { children: ReactNode }) {
  const { addTransaction, loaded: txLoaded } = useTransactions();
  const [items, setItems] = useState<Recurring[]>([]);
  const [recLoaded, setRecLoaded] = useState(false);
  const processed = useRef(false);

  useEffect(() => {
    loadRecurring().then((data) => {
      setItems(data as Recurring[]);
      setRecLoaded(true);
    });
  }, []);

  // Genera los gastos que ya "vencieron" de un recurrente y devuelve su versión actualizada
  const runDue = (r: Recurring): Recurring => {
    const now = new Date();
    const nowIndex = monthIndex(now);
    let last = r.lastMonthIndex;

    // Si la app estuvo mucho tiempo sin abrirse, recuperamos como máximo 12 meses
    if (nowIndex - last > 12) last = nowIndex - 12;

    for (let idx = last + 1; idx <= nowIndex; idx++) {
      const year = Math.floor(idx / 12);
      const month = idx % 12;
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      const date = new Date(year, month, Math.min(r.dayOfMonth, lastDayOfMonth), 9, 0, 0);

      if (date.getTime() > now.getTime()) break; // todavía no llega el día

      addTransaction({
        title: r.title,
        amountCents: r.amountCents,
        type: r.type,
        categoryId: r.categoryId,
        recurringId: r.id,
        date: date.toISOString(),
      });
      last = idx;
    }
    return { ...r, lastMonthIndex: last };
  };

  // Al abrir la app: cuando ya cargó todo, generar lo pendiente (una sola vez)
  useEffect(() => {
    if (!txLoaded || !recLoaded || processed.current) return;
    processed.current = true;
    const updated = items.map(runDue);
    if (updated.some((u, i) => u.lastMonthIndex !== items[i].lastMonthIndex)) {
      setItems(updated);
      saveRecurring(updated);
    }
  }, [txLoaded, recLoaded]);

  const addRecurring = (r: NewRecurring) => {
    const base: Recurring = {
      ...r,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      lastMonthIndex: monthIndex(new Date()) - 1, // así este mes también cuenta si el día ya pasó
    };
    const ready = runDue(base);
    const next = [...items, ready];
    setItems(next);
    saveRecurring(next);
  };

  const deleteRecurring = (id: string) => {
    const next = items.filter((r) => r.id !== id);
    setItems(next);
    saveRecurring(next);
  };

  return (
    <RecurringContext.Provider value={{ items, addRecurring, deleteRecurring }}>
      {children}
    </RecurringContext.Provider>
  );
}

export function useRecurring() {
  const ctx = useContext(RecurringContext);
  if (!ctx) throw new Error('useRecurring debe usarse dentro de RecurringProvider');
  return ctx;
}