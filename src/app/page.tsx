import Image from 'next/image';
import Link from 'next/link';
import { Camera, LineChart, NotebookPen, Sparkles } from 'lucide-react';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: NotebookPen,
    title: 'Every bottle, catalogued',
    body: 'Producer, vintage, region, bottle size and quantity — searchable and sortable, with your own tasting notes attached.',
  },
  {
    icon: Camera,
    title: 'Labels and corks',
    body: 'Photograph what you drink. Labels, corks and the occasional dinner table, kept with the bottle they belong to.',
  },
  {
    icon: Sparkles,
    title: 'An AI sommelier',
    body: 'Generate background on any wine, or ask your collection questions — what to open tonight, what pairs with dinner.',
  },
  {
    icon: LineChart,
    title: 'Know your cellar',
    body: 'Value, spread by country, grape and vintage. Export to CSV whenever you want your data elsewhere.',
  },
];

export default function Home() {
  return (
    <Layout>
      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-12 pb-16 text-center sm:pt-20">
        <Image
          src="/logo_black_transparent.png"
          alt=""
          width={120}
          height={120}
          priority
          className="mb-8 dark:hidden"
        />
        <Image
          src="/logo_color_transparent.png"
          alt=""
          width={120}
          height={120}
          priority
          className="mb-8 hidden dark:block"
        />

        <h1 className="font-display text-4xl leading-tight font-semibold text-balance sm:text-6xl">
          Your cellar, finally in one place
        </h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-lg text-pretty">
          Track what you own, remember what you tasted, and decide what to open next.
        </p>

        <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild size="lg">
            <Link href="/register">Start your cellar</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-16 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4">
              <Icon className="text-primary mt-1 size-6 shrink-0" aria-hidden />
              <div>
                <h2 className="font-display text-xl font-semibold">{title}</h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card border-t">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Free, and your cellar stays yours
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-pretty">
            No subscription. Export everything to CSV whenever you like.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">Create a free account</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link href="/learn-more">See what it does</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
