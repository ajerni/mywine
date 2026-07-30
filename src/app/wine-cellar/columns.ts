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
  /** Hidden below the xl breakpoint unless the user overrides visibility. */
  secondary?: boolean;
  /** Default width in px for the fixed desktop table layout. */
  defaultWidth: number;
  minWidth: number;
}

export const WINE_COLUMNS: WineColumn[] = [
  { key: 'name', label: 'Name', numeric: false, defaultWidth: 260, minWidth: 140 },
  { key: 'producer', label: 'Producer', numeric: false, defaultWidth: 140, minWidth: 90 },
  { key: 'grapes', label: 'Grapes', numeric: false, secondary: true, defaultWidth: 130, minWidth: 80 },
  { key: 'country', label: 'Country', numeric: false, secondary: true, defaultWidth: 88, minWidth: 70 },
  { key: 'region', label: 'Region', numeric: false, secondary: true, defaultWidth: 100, minWidth: 70 },
  { key: 'year', label: 'Year', numeric: true, defaultWidth: 72, minWidth: 56 },
  { key: 'price', label: 'Price', numeric: true, defaultWidth: 88, minWidth: 64 },
  {
    key: 'bottle_size',
    label: 'Size',
    numeric: true,
    secondary: true,
    defaultWidth: 72,
    minWidth: 56,
  },
  { key: 'quantity', label: 'Qty', numeric: true, defaultWidth: 56, minWidth: 48 },
  { key: 'rating', label: 'Rating', numeric: true, defaultWidth: 110, minWidth: 90 },
];

/** Fields a free-text search box looks at. */
export const SEARCHABLE_KEYS: (keyof Wine)[] = [
  'name',
  'producer',
  'grapes',
  'country',
  'region',
];
