import { BOTTLE_SIZES } from '../../bottle_sizes';
import { SectionCard } from './SectionCard';
import type { Wine } from '../../types';

function bottleLabel(size?: number) {
  if (!size) return null;
  return (
    BOTTLE_SIZES.find((entry) => Math.abs(entry.value - size) < 0.001)?.text ??
    `${size} L`
  );
}

export function DetailsSection({ wine }: { wine: Wine }) {
  const rows: [string, string | number | null | undefined][] = [
    ['Producer', wine.producer],
    ['Grapes', wine.grapes],
    ['Country', wine.country],
    ['Region', wine.region],
    ['Year', wine.year],
    ['Bottle size', bottleLabel(wine.bottle_size)],
    ['Price', wine.price ? `$${wine.price}` : null],
    ['Quantity', wine.quantity ?? 0],
  ];

  return (
    <SectionCard title="Details">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        {rows
          .filter(([, value]) => value !== null && value !== undefined && value !== '')
          .map(([label, value]) => (
            <div key={label} className="col-span-2 grid grid-cols-subgrid">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right break-words">{value}</dd>
            </div>
          ))}
      </dl>
    </SectionCard>
  );
}
