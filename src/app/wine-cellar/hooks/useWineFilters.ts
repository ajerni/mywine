'use client';

import { useCallback, useMemo, useState } from 'react';

import { SEARCHABLE_KEYS, WINE_COLUMNS, type WineColumnKey } from '../columns';
import type { NumericFilter, Wine } from '../types';

export type WineFilters = Partial<Record<WineColumnKey, string | NumericFilter>>;

export interface SortState {
  key: WineColumnKey;
  direction: 'asc' | 'desc';
}

const EMPTY_FILTERS: WineFilters = {};

function isFilled(filter: string | NumericFilter | undefined): boolean {
  if (!filter) return false;
  return typeof filter === 'string' ? filter.trim() !== '' : filter.value.trim() !== '';
}

function matchesNumeric(wineValue: unknown, filter: NumericFilter): boolean {
  const target = Number(filter.value);
  if (Number.isNaN(target)) return true;
  if (wineValue === null || wineValue === undefined || wineValue === '') return false;

  const actual = Number(wineValue);
  if (Number.isNaN(actual)) return false;

  switch (filter.operator) {
    case '<':
      return actual < target;
    case '>':
      return actual > target;
    default:
      return actual === target;
  }
}

function compare(a: Wine, b: Wine, sort: SortState): number {
  const left = a[sort.key];
  const right = b[sort.key];

  // Missing values always sort last, whichever direction is active.
  const leftEmpty = left === null || left === undefined || left === '';
  const rightEmpty = right === null || right === undefined || right === '';
  if (leftEmpty && rightEmpty) return 0;
  if (leftEmpty) return 1;
  if (rightEmpty) return -1;

  // Postgres returns numeric columns as strings, so trust the column metadata
  // rather than the runtime type.
  const isNumeric = WINE_COLUMNS.find((column) => column.key === sort.key)?.numeric;
  const result = isNumeric
    ? Number(left) - Number(right)
    : String(left).localeCompare(String(right), undefined, { sensitivity: 'base' });

  return sort.direction === 'asc' ? result : -result;
}

export function useWineFilters(wines: Wine[]) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<WineFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortState>({ key: 'name', direction: 'asc' });

  const setFilter = useCallback(
    (key: WineColumnKey, value: string | NumericFilter) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setSearch('');
  }, []);

  const toggleSort = useCallback((key: WineColumnKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
  }, []);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(isFilled).length,
    [filters],
  );

  const visibleWines = useMemo(() => {
    const query = search.trim().toLowerCase();

    const matched = wines.filter((wine) => {
      if (query) {
        const hit = SEARCHABLE_KEYS.some((key) =>
          String(wine[key] ?? '')
            .toLowerCase()
            .includes(query),
        );
        if (!hit) return false;
      }

      for (const [key, filter] of Object.entries(filters)) {
        if (!isFilled(filter)) continue;

        if (key === 'rating') {
          const wanted = Number(filter as string);
          const rating = wine.rating ?? 0;
          // One star means "rated at all"; anything higher is a floor.
          if (rating < wanted || rating === 0) return false;
          continue;
        }

        const value = wine[key as keyof Wine];

        if (typeof filter === 'object') {
          if (!matchesNumeric(value, filter)) return false;
        } else if (
          !String(value ?? '')
            .toLowerCase()
            .includes(filter.toLowerCase())
        ) {
          return false;
        }
      }

      return true;
    });

    return matched.sort((a, b) => compare(a, b, sort));
  }, [wines, search, filters, sort]);

  return {
    search,
    setSearch,
    filters,
    setFilter,
    resetFilters,
    activeFilterCount,
    sort,
    setSort,
    toggleSort,
    visibleWines,
    isFiltered: activeFilterCount > 0 || search.trim() !== '',
  };
}
