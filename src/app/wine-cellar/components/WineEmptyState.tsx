import { FilterX, Grape, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Shell({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="bg-secondary text-muted-foreground mb-4 flex size-14 items-center justify-center rounded-full">
        {icon}
      </div>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">{description}</p>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}

export function WineEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Shell
      icon={<Grape className="size-7" />}
      title="Your cellar is empty"
      description="Add your first bottle to start tracking vintages, tasting notes and ratings."
    >
      <Button onClick={onAdd}>
        <Plus />
        Add your first wine
      </Button>
    </Shell>
  );
}

export function WineNoResultsState({ onReset }: { onReset: () => void }) {
  return (
    <Shell
      icon={<FilterX className="size-7" />}
      title="No wines match"
      description="Nothing in your cellar matches the current search and filters."
    >
      <Button variant="outline" onClick={onReset}>
        <FilterX />
        Clear search and filters
      </Button>
    </Shell>
  );
}

export function WineErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Shell
      icon={<RefreshCw className="size-7" />}
      title="Something went wrong"
      description={message}
    >
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw />
        Try again
      </Button>
    </Shell>
  );
}
