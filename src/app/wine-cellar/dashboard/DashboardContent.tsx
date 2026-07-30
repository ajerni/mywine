'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { CalendarRange, DollarSign, Globe, Grape, Wine as WineIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useWines } from '../WineProvider';
import { WineErrorState } from '../components/WineEmptyState';
import type { Wine } from '../types';
import { StatCard } from './components/StatCard';
import { BreakdownChart, type BreakdownRow } from './components/BreakdownChart';

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const formatMoney = (value: number) => currency.format(value);

type Buckets = Map<string, { count: number; value: number }>;

function bucket(buckets: Buckets, key: string, count: number, value: number) {
  const existing = buckets.get(key) ?? { count: 0, value: 0 };
  buckets.set(key, { count: existing.count + count, value: existing.value + value });
}

function toRows(buckets: Buckets, compare: (a: BreakdownRow, b: BreakdownRow) => number) {
  return Array.from(buckets, ([label, data]) => ({ label, ...data })).sort(compare);
}

const byCount = (a: BreakdownRow, b: BreakdownRow) => b.count - a.count;
const byLabelDescending = (a: BreakdownRow, b: BreakdownRow) => Number(b.label) - Number(a.label);

function summarise(wines: Wine[]) {
  const countries: Buckets = new Map();
  const grapes: Buckets = new Map();
  const vintages: Buckets = new Map();
  let totalBottles = 0;
  let totalValue = 0;

  for (const wine of wines) {
    // Postgres returns numeric columns as strings, so coerce before arithmetic.
    const quantity = Number(wine.quantity) || 0;
    const value = quantity * (Number(wine.price) || 0);
    totalBottles += quantity;
    totalValue += value;

    if (wine.country) bucket(countries, wine.country, quantity, value);
    if (wine.year) bucket(vintages, String(wine.year), quantity, value);
    for (const grape of wine.grapes?.split(',') ?? []) {
      const trimmed = grape.trim();
      if (trimmed) bucket(grapes, trimmed, quantity, value);
    }
  }

  return {
    totalBottles,
    totalValue,
    uniqueWines: wines.length,
    countries: toRows(countries, byCount),
    grapes: toRows(grapes, byCount),
    vintages: toRows(vintages, byLabelDescending),
  };
}

export default function DashboardContent() {
  const { wines, status, error, reload } = useWines();
  const stats = useMemo(() => summarise(wines), [wines]);

  if (status === 'error') {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <WineErrorState message={error ?? 'Unknown error'} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          How your collection breaks down by origin, grape and vintage.
        </p>
      </div>

      {status === 'loading' ? (
        <DashboardSkeleton />
      ) : wines.length === 0 ? (
        <EmptyDashboard />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard icon={WineIcon} label="Bottles" value={String(stats.totalBottles)} />
            <StatCard icon={Grape} label="Unique wines" value={String(stats.uniqueWines)} />
            <StatCard icon={DollarSign} label="Estimated value" value={formatMoney(stats.totalValue)} />
            <StatCard icon={Globe} label="Countries" value={String(stats.countries.length)} />
            <StatCard icon={CalendarRange} label="Vintages" value={String(stats.vintages.length)} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <BreakdownChart
              title="By country"
              description="Where your bottles come from"
              rows={stats.countries}
              formatValue={formatMoney}
            />
            <BreakdownChart
              title="By grape"
              description="Top ten varieties in the cellar"
              rows={stats.grapes.slice(0, 10)}
              formatValue={formatMoney}
            />
            <BreakdownChart
              title="By vintage"
              description="Newest year first"
              rows={stats.vintages}
              formatValue={formatMoney}
            />
          </div>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-72 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="bg-secondary text-muted-foreground mb-4 flex size-14 items-center justify-center rounded-full">
        <Grape className="size-7" />
      </div>
      <h2 className="font-display text-xl font-semibold">Nothing to chart yet</h2>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        Add a few bottles and this page will show how your collection breaks down.
      </p>
      <Button asChild className="mt-6">
        <Link href="/wine-cellar">Go to your cellar</Link>
      </Button>
    </div>
  );
}
