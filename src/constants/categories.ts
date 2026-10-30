export type CategoryId =
  | 'food'
  | 'transport'
  | 'leisure'
  | 'health'
  | 'home'
  | 'education'
  | 'other';

export type Category = { id: CategoryId; label: string; emoji: string };

export const CATEGORIES: Category[] = [
  { id: 'food', label: 'Comida', emoji: '' },
  { id: 'transport', label: 'Transporte', emoji: '' },
  { id: 'leisure', label: 'Ocio', emoji: '' },
  { id: 'health', label: 'Salud', emoji: '' },
  { id: 'home', label: 'Hogar', emoji: '' },
  { id: 'education', label: 'Estudios', emoji: '' },
  { id: 'other', label: 'Otros', emoji: '' },
];

// Si un gasto antiguo no tiene categoría, cae en "Otros"
export const getCategory = (id?: string): Category =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];