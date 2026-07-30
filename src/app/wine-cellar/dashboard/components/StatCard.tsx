import type { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
        <Icon className="text-accent size-4 shrink-0" aria-hidden />
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
