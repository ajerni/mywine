'use client';

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
import { WINE_COLUMNS, type WineColumnKey } from '../columns';
import { StarRating } from './StarRating';
import type { Wine } from '../types';

interface WineTableProps {
  wines: Wine[];
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
  sortKey,
  sortDirection,
  onToggleSort,
  onSelect,
}: WineTableProps) {
  return (
    <div className="hidden lg:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {WINE_COLUMNS.map((column) => {
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
                  className={cn(
                    column.numeric && 'text-right',
                    column.secondary && 'hidden xl:table-cell',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onToggleSort(column.key)}
                    className={cn(
                      'hover:text-foreground inline-flex items-center gap-1 rounded-sm transition-colors',
                      isSorted && 'text-foreground font-semibold',
                    )}
                  >
                    {column.label}
                    <Icon
                      className={cn('size-3.5', !isSorted && 'opacity-40')}
                      aria-hidden
                    />
                  </button>
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
              {WINE_COLUMNS.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    'max-w-0 truncate',
                    column.numeric && 'text-right tabular-nums',
                    column.secondary && 'hidden xl:table-cell',
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
