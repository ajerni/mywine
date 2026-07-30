'use client';

import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    // The server has no viewport; components must render a layout-neutral
    // shell and let CSS breakpoints do the real work.
    () => false,
  );
}
