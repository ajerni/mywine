'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { WINE_COLUMNS, type WineColumn, type WineColumnKey } from '../columns';

const WIDTHS_KEY = 'wine-table-column-widths';
const VISIBILITY_KEY = 'wine-table-column-visibility';

type WidthMap = Partial<Record<WineColumnKey, number>>;
type VisibilityMap = Partial<Record<WineColumnKey, boolean>>;

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function columnByKey(key: WineColumnKey): WineColumn {
  return WINE_COLUMNS.find((column) => column.key === key) ?? WINE_COLUMNS[0];
}

export function useWineTableLayout() {
  const [widths, setWidths] = useState<WidthMap>({});
  const [visibilityPrefs, setVisibilityPrefs] = useState<VisibilityMap>({});
  const [isXl, setIsXl] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setWidths(readJson<WidthMap>(WIDTHS_KEY) ?? {});
    setVisibilityPrefs(readJson<VisibilityMap>(VISIBILITY_KEY) ?? {});
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    const sync = () => setIsXl(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    localStorage.setItem(WIDTHS_KEY, JSON.stringify(widths));
  }, [widths, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    localStorage.setItem(VISIBILITY_KEY, JSON.stringify(visibilityPrefs));
  }, [visibilityPrefs, hasHydrated]);

  const isColumnVisible = useCallback(
    (column: WineColumn) => {
      if (column.key === 'name') return true;
      const preference = visibilityPrefs[column.key];
      if (preference !== undefined) return preference;
      return column.secondary ? isXl : true;
    },
    [visibilityPrefs, isXl],
  );

  const visibleColumns = useMemo(
    () => WINE_COLUMNS.filter(isColumnVisible),
    [isColumnVisible],
  );

  const getWidth = useCallback(
    (key: WineColumnKey) => widths[key] ?? columnByKey(key).defaultWidth,
    [widths],
  );

  const setColumnWidth = useCallback((key: WineColumnKey, width: number) => {
    const minWidth = columnByKey(key).minWidth;
    setWidths((previous) => ({
      ...previous,
      [key]: Math.max(minWidth, Math.round(width)),
    }));
  }, []);

  const toggleColumn = useCallback(
    (key: WineColumnKey) => {
      if (key === 'name') return;
      const column = columnByKey(key);
      setVisibilityPrefs((previous) => {
        const currentlyVisible =
          previous[key] ?? (column.secondary ? isXl : true);
        return { ...previous, [key]: !currentlyVisible };
      });
    },
    [isXl],
  );

  const resetLayout = useCallback(() => {
    setWidths({});
    setVisibilityPrefs({});
    localStorage.removeItem(WIDTHS_KEY);
    localStorage.removeItem(VISIBILITY_KEY);
  }, []);

  return {
    visibleColumns,
    getWidth,
    setColumnWidth,
    isColumnVisible,
    toggleColumn,
    resetLayout,
  };
}
