'use client';

import { ArrowDownUp, MessageSquare, Plus, Search, SlidersHorizontal, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WINE_COLUMNS, type WineColumnKey } from '../columns';
import type { SortState, WineFilters } from '../hooks/useWineFilters';
import type { NumericFilter } from '../types';

interface WineToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: WineFilters;
  activeFilterCount: number;
  onOpenFilters: () => void;
  onClearFilter: (key: WineColumnKey) => void;
  onResetFilters: () => void;
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  onAdd: () => void;
  onOpenChat?: () => void;
  totalCount: number;
  visibleCount: number;
}

function describeFilter(
  key: WineColumnKey,
  filter: string | NumericFilter,
): string {
  const label = WINE_COLUMNS.find((column) => column.key === key)?.label ?? key;
  if (key === 'rating') {
    return Number(filter) === 1 ? 'Rated wines' : `Rating ≥ ${filter}`;
  }
  return typeof filter === 'string'
    ? `${label}: ${filter}`
    : `${label} ${filter.operator} ${filter.value}`;
}

export function WineToolbar({
  search,
  onSearchChange,
  filters,
  activeFilterCount,
  onOpenFilters,
  onClearFilter,
  onResetFilters,
  sort,
  onSortChange,
  onAdd,
  onOpenChat,
  totalCount,
  visibleCount,
}: WineToolbarProps) {
  const activeFilters = Object.entries(filters).filter(([, filter]) => {
    if (!filter) return false;
    return typeof filter === 'string' ? filter.trim() !== '' : filter.value.trim() !== '';
  }) as [WineColumnKey, string | NumericFilter][];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-full sm:basis-64">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search name, producer, grapes, region…"
            aria-label="Search your wines"
            className="pl-9"
          />
        </div>

        <Select
          value={`${sort.key}:${sort.direction}`}
          onValueChange={(value) => {
            const [key, direction] = value.split(':');
            onSortChange({
              key: key as WineColumnKey,
              direction: direction as 'asc' | 'desc',
            });
          }}
        >
          <SelectTrigger className="w-[9.5rem] lg:hidden" aria-label="Sort wines">
            <ArrowDownUp className="size-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WINE_COLUMNS.flatMap((column) => [
              <SelectItem key={`${column.key}:asc`} value={`${column.key}:asc`}>
                {column.label} ↑
              </SelectItem>,
              <SelectItem key={`${column.key}:desc`} value={`${column.key}:desc`}>
                {column.label} ↓
              </SelectItem>,
            ])}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={onOpenFilters}>
          <SlidersHorizontal />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 tabular-nums">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {onOpenChat && (
          <Button variant="outline" onClick={onOpenChat}>
            <MessageSquare />
            <span className="hidden sm:inline">AI Chat</span>
          </Button>
        )}

        <Button onClick={onAdd} className="ml-auto">
          <Plus />
          <span className="hidden sm:inline">Add wine</span>
          <span className="sr-only sm:hidden">Add wine</span>
        </Button>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map(([key, filter]) => (
            <button
              key={key}
              type="button"
              onClick={() => onClearFilter(key)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/70 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
            >
              {describeFilter(key, filter)}
              <X className="size-3" />
              <span className="sr-only">Remove filter</span>
            </button>
          ))}
          <Button variant="ghost" size="sm" onClick={onResetFilters}>
            Clear all
          </Button>
        </div>
      )}

      <p className="text-muted-foreground text-xs" aria-live="polite">
        {visibleCount === totalCount
          ? `${totalCount} ${totalCount === 1 ? 'wine' : 'wines'}`
          : `${visibleCount} of ${totalCount} wines`}
      </p>
    </div>
  );
}
