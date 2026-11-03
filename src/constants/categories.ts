export type CategoryId = string;

export type Category = { id: CategoryId; label: string; color: string };

// Categoría de respaldo: no se puede eliminar y recibe los gastos huérfanos
export const FALLBACK_ID: CategoryId = 'other';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', label: 'Comida', color: '#FF8A5B' },
  { id: 'transport', label: 'Transporte', color: '#4DA3FF' },
  { id: 'leisure', label: 'Ocio', color: '#B084FF' },
  { id: 'health', label: 'Salud', color: '#FF6B9A' },
  { id: 'home', label: 'Hogar', color: '#35D0A0' },
  { id: 'education', label: 'Estudios', color: '#FFD166' },
  { id: 'other', label: 'Otros', color: '#8A8A8A' },
];

export const COLOR_OPTIONS = [
  '#FF8A5B', '#FF5252', '#FF6B9A', '#B084FF', '#4DA3FF', '#35C5E0',
  '#35D0A0', '#7ED957', '#D9F50A', '#FFD166', '#C98B5A', '#8A8A8A',
];