'use client';

import { useRef } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { type WineColumn, type WineColumnKey } from '../columns';
import { StarRating } from './StarRating';
import type { Wine } from '../types';

interface WineTableProps {
  wines: Wine[];
  columns: WineColumn[];
  getWidth: (key: WineColumnKey) => number;
  onResizeColumn: (key: WineColumnKey, width: number) => void;
  sortKey: WineColumnKey;
  sortDirection: 'asc' | 'desc';
  onToggleSort: (key: WineColumnKey) => void;
  onSelect: (wine: Wine) => void;
}

function renderCell(wine: Wine, key: WineColumnKey) {
  switch (key) {
    case 'rating':
      return wine.rating ? (
        <StarRating rating={wine.rating} readonly size="sm" className="justify-end" />
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    case 'price':
      return wine.price ? `$${wine.price}` : <span className="text-muted-foreground">—</span>;
    case 'bottle_size':
      return wine.bottle_size ? (
        `${wine.bottle_size} L`
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    case 'name':
      return <span className="font-medium">{wine.name}</span>;
    default: {
      const value = wine[key];
      return value === null || value === undefined || value === '' ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        value
      );
    }
  }
}

export function WineTable({
  wines,
  columns,
  getWidth,
  onResizeColumn,
  sortKey,
  sortDirection,
  onToggleSort,
  onSelect,
}: WineTableProps) {
  const resizingRef = useRef<{
    key: WineColumnKey;
    startX: number;
    startWidth: number;
  } | null>(null);

  const startResize = (
    event: React.PointerEvent<HTMLSpanElement>,
    key: WineColumnKey,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    resizingRef.current = {
      key,
      startX: event.clientX,
      startWidth: getWidth(key),
    };

    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onPointerMove = (moveEvent: PointerEvent) => {
      const active = resizingRef.current;
      if (!active) return;
      onResizeColumn(active.key, active.startWidth + moveEvent.clientX - active.startX);
    };

    const onPointerUp = () => {
      resizingRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div className="hidden lg:block">
      <Table className="table-fixed">
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={{ width: getWidth(column.key) }} />
          ))}
        </colgroup>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => {
              const isSorted = sortKey === column.key;
              const Icon = !isSorted
                ? ChevronsUpDown
                : sortDirection === 'asc'
                  ? ArrowUp
                  : ArrowDown;

              return (
                <TableHead
                  key={column.key}
                  aria-sort={
                    isSorted
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                  className={cn('relative', column.numeric && 'text-right')}
                >
                  <button
                    type="button"
                    onClick={() => onToggleSort(column.key)}
                    className={cn(
                      'hover:text-foreground inline-flex max-w-full items-center gap-1 truncate rounded-sm transition-colors',
                      column.numeric && 'justify-end',
                      isSorted && 'text-foreground font-semibold',
                    )}
                  >
                    {column.label}
                    <Icon
                      className={cn('size-3.5 shrink-0', !isSorted && 'opacity-40')}
                      aria-hidden
                    />
                  </button>
                  <span
                    role="separator"
                    aria-orientation="vertical"
                    aria-label={`Resize ${column.label} column`}
                    onPointerDown={(event) => startResize(event, column.key)}
                    onClick={(event) => event.stopPropagation()}
                    className="hover:bg-foreground/15 absolute top-0 -right-1 z-10 h-full w-2 cursor-col-resize touch-none select-none"
                  />
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>

        <TableBody>
          {wines.map((wine) => (
            <TableRow
              key={wine.id}
              tabIndex={0}
              role="button"
              aria-label={`Open ${wine.name}`}
              onClick={() => onSelect(wine)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(wine);
                }
              }}
              className="cursor-pointer"
            >
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    'truncate',
                    column.numeric && 'text-right tabular-nums',
                  )}
                >
                  {renderCell(wine, column.key)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
