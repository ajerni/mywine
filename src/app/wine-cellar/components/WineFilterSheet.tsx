'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { WINE_COLUMNS, type WineColumnKey } from '../columns';
import type { WineFilters } from '../hooks/useWineFilters';
import type { NumericFilter } from '../types';
import { StarRating } from './StarRating';

interface WineFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: WineFilters;
  onFilterChange: (key: WineColumnKey, value: string | NumericFilter) => void;
  onReset: () => void;
  activeFilterCount: number;
  resultCount: number;
}

export function WineFilterSheet({
  open,
  onOpenChange,
  filters,
  onFilterChange,
  onReset,
  activeFilterCount,
  resultCount,
}: WineFilterSheetProps) {
  const ratingFilter = Number(filters.rating ?? 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b pr-14">
          <SheetTitle className="font-display text-lg">
            Filters
            {activeFilterCount > 0 && (
              <span className="text-muted-foreground ml-2 text-sm font-normal">
                {activeFilterCount} active
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-3">
              <StarRating
                rating={ratingFilter}
                onRatingChange={(rating) =>
                  onFilterChange('rating', rating.toString())
                }
              />
              <span className="text-muted-foreground text-xs">
                {ratingFilter
                  ? ratingFilter === 1
                    ? 'Rated wines'
                    : `${ratingFilter}★ or more`
                  : 'Any'}
              </span>
              {ratingFilter > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => onFilterChange('rating', '')}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {WINE_COLUMNS.filter((column) => column.key !== 'rating').map((column) => {
            const filter = filters[column.key];

            if (column.numeric) {
              const numeric = (filter as NumericFilter) ?? { value: '', operator: '=' };
              return (
                <div key={column.key} className="space-y-2">
                  <Label htmlFor={`filter-${column.key}`}>{column.label}</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={numeric.operator}
                      onValueChange={(operator) =>
                        onFilterChange(column.key, {
                          ...numeric,
                          operator: operator as NumericFilter['operator'],
                        })
                      }
                    >
                      <SelectTrigger
                        className="w-[4.5rem]"
                        aria-label={`${column.label} comparison`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<">&lt;</SelectItem>
                        <SelectItem value="=">=</SelectItem>
                        <SelectItem value=">">&gt;</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id={`filter-${column.key}`}
                      type="number"
                      inputMode="decimal"
                      value={numeric.value}
                      onChange={(event) =>
                        onFilterChange(column.key, {
                          ...numeric,
                          value: event.target.value,
                        })
                      }
                      placeholder="Any"
                      className="flex-1"
                    />
                  </div>
                </div>
              );
            }

            return (
              <div key={column.key} className="space-y-2">
                <Label htmlFor={`filter-${column.key}`}>{column.label}</Label>
                <Input
                  id={`filter-${column.key}`}
                  value={(filter as string) ?? ''}
                  onChange={(event) => onFilterChange(column.key, event.target.value)}
                  placeholder={`Any ${column.label.toLowerCase()}`}
                />
              </div>
            );
          })}
        </div>

        <SheetFooter className="flex-row border-t">
          <Button variant="outline" className="flex-1" onClick={onReset}>
            Reset
          </Button>
          <Button className="flex-1" onClick={() => onOpenChange(false)}>
            Show {resultCount} {resultCount === 1 ? 'wine' : 'wines'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
