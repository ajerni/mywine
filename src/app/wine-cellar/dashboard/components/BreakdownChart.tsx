import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface BreakdownRow {
  label: string;
  count: number;
  value: number;
}

export function BreakdownChart({
  title,
  description,
  rows,
  formatValue,
}: {
  title: string;
  description: string;
  rows: BreakdownRow[];
  formatValue: (value: number) => string;
}) {
  // Scale bars against the largest row so small collections still read clearly.
  const max = rows.reduce((largest, row) => Math.max(largest, row.count), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nothing recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.label}>
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="truncate font-medium">{row.label}</span>
                  <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
                    {row.count} {row.count === 1 ? 'bottle' : 'bottles'} ·{' '}
                    {formatValue(row.value)}
                  </span>
                </div>
                <div
                  className="bg-secondary mt-1.5 h-2 overflow-hidden rounded-full"
                  role="img"
                  aria-label={`${row.label}: ${row.count} bottles`}
                >
                  <div
                    className="bg-primary h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${max === 0 ? 0 : (row.count / max) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
