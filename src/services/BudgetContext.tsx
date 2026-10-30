import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { loadBudget, saveBudget } from './storage';

type BudgetValue = {
  budgetCents: number; // 0 = sin presupuesto definido
  setBudgetCents: (cents: number) => void;
};

const BudgetContext = createContext<BudgetValue | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgetCents, setBudget] = useState(0);

  useEffect(() => {
    loadBudget().then(setBudget);
  }, []);

  const setBudgetCents = (cents: number) => {
    setBudget(cents);
    saveBudget(cents);
  };

  return (
    <BudgetContext.Provider value={{ budgetCents, setBudgetCents }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget debe usarse dentro de BudgetProvider');
  return ctx;
}