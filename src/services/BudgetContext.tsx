import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { CategoryId } from '../constants/categories';
import {
  loadBudget,
  saveBudget,
  loadCategoryBudgets,
  saveCategoryBudgets,
} from './storage';

type CategoryBudgets = Partial<Record<CategoryId, number>>;

type BudgetValue = {
  budgetCents: number; // presupuesto total del mes (0 = sin definir)
  setBudgetCents: (cents: number) => void;
  categoryBudgets: CategoryBudgets; // límite por categoría, en centavos
  setCategoryBudgets: (budgets: CategoryBudgets) => void;
};

const BudgetContext = createContext<BudgetValue | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgetCents, setBudget] = useState(0);
  const [categoryBudgets, setCatBudgets] = useState<CategoryBudgets>({});

  useEffect(() => {
    loadBudget().then(setBudget);
    loadCategoryBudgets().then((b) => setCatBudgets(b as CategoryBudgets));
  }, []);

  const setBudgetCents = (cents: number) => {
    setBudget(cents);
    saveBudget(cents);
  };

  const setCategoryBudgets = (budgets: CategoryBudgets) => {
    setCatBudgets(budgets);
    saveCategoryBudgets(budgets as Record<string, number>);
  };

  return (
    <BudgetContext.Provider
      value={{ budgetCents, setBudgetCents, categoryBudgets, setCategoryBudgets }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget debe usarse dentro de BudgetProvider');
  return ctx;
}