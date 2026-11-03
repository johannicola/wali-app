import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Category, DEFAULT_CATEGORIES, FALLBACK_ID } from '../constants/categories';
import { loadCategories, saveCategories } from './storage';

type CategoriesValue = {
  categories: Category[];
  getCategory: (id?: string) => Category;
  addCategory: (label: string, color: string) => string | null; // devuelve un error o null
  updateCategory: (id: string, label: string, color: string) => string | null;
  deleteCategory: (id: string) => void;
};

const CategoriesContext = createContext<CategoriesValue | undefined>(undefined);

const DEFAULT_COLOR = '#8A8A8A';
const fallbackCategory = DEFAULT_CATEGORIES.find((c) => c.id === FALLBACK_ID)!;

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCategories().then((saved) => {
      if (saved && saved.length > 0) {
        const hasFallback = saved.some((c) => c.id === FALLBACK_ID);
        setCategories(hasFallback ? saved : [...saved, fallbackCategory]);
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) saveCategories(categories);
  }, [categories, loaded]);

  const getCategory = useCallback(
    (id?: string): Category =>
      categories.find((c) => c.id === id) ??
      categories.find((c) => c.id === FALLBACK_ID) ??
      fallbackCategory,
    [categories]
  );

  const validate = (label: string, exceptId?: string): string | null => {
    const name = label.trim();
    if (!name) return 'Escribe un nombre para la categoría.';
    if (name.length > 20) return 'El nombre es muy largo (máximo 20 caracteres).';
    const repeated = categories.some(
      (c) => c.id !== exceptId && c.label.trim().toLowerCase() === name.toLowerCase()
    );
    if (repeated) return 'Ya existe una categoría con ese nombre.';
    return null;
  };

  const addCategory = (label: string, color: string): string | null => {
    const error = validate(label);
    if (error) return error;

    const newCategory: Category = {
      id: `cat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      label: label.trim(),
      color: color || DEFAULT_COLOR,
    };

    // La nueva va antes de "Otros", que siempre queda al final
    setCategories((prev) => {
      const index = prev.findIndex((c) => c.id === FALLBACK_ID);
      if (index === -1) return [...prev, newCategory];
      return [...prev.slice(0, index), newCategory, ...prev.slice(index)];
    });
    return null;
  };

  const updateCategory = (id: string, label: string, color: string): string | null => {
    const error = validate(label, id);
    if (error) return error;

    setCategories((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, label: label.trim(), color: color || DEFAULT_COLOR } : c
      )
    );
    return null;
  };

  const deleteCategory = (id: string) => {
    if (id === FALLBACK_ID) return; // "Otros" no se puede eliminar
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <CategoriesContext.Provider
      value={{ categories, getCategory, addCategory, updateCategory, deleteCategory }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error('useCategories debe usarse dentro de CategoriesProvider');
  return ctx;
}