import type { Wine } from './types';

export type WineColumnKey =
  | 'name'
  | 'producer'
  | 'grapes'
  | 'country'
  | 'region'
  | 'year'
  | 'price'
  | 'bottle_size'
  | 'quantity'
  | 'rating';

export interface WineColumn {
  key: WineColumnKey;
  label: string;
  numeric: boolean;
  /** Hidden on narrower desktop widths to keep the table readable. */
  secondary?: boolean;
}

export const WINE_COLUMNS: WineColumn[] = [
  { key: 'name', label: 'Name', numeric: false },
  { key: 'producer', label: 'Producer', numeric: false },
  { key: 'grapes', label: 'Grapes', numeric: false, secondary: true },
  { key: 'country', label: 'Country', numeric: false, secondary: true },
  { key: 'region', label: 'Region', numeric: false, secondary: true },
  { key: 'year', label: 'Year', numeric: true },
  { key: 'price', label: 'Price', numeric: true },
  { key: 'bottle_size', label: 'Size', numeric: true, secondary: true },
  { key: 'quantity', label: 'Qty', numeric: true },
  { key: 'rating', label: 'Rating', numeric: true },
];

/** Fields a free-text search box looks at. */
export const SEARCHABLE_KEYS: (keyof Wine)[] = [
  'name',
  'producer',
  'grapes',
  'region',
];
