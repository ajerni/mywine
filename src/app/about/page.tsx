import type { Metadata } from 'next';
import Link from 'next/link';

import Layout from '@/components/layout/Layout';
import { PageHeading } from '@/components/layout/PageHeading';
import { Button } from '@/components/ui/button';
import { DonationCards } from './components/DonationCard';

export const metadata: Metadata = {
  title: 'About',
  description:
    'MyWine.info is a digital cellar book — track what you own, remember what you tasted, and decide what to open next.',
};

export default function AboutPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-16 px-4 py-12">
        <PageHeading
          title="About MyWine.info"
          description="A cellar book that happens to run in a browser."
        />

        <section className="space-y-4 text-pretty">
          <h2 className="font-display text-2xl font-semibold">Why it exists</h2>
          <p className="text-muted-foreground leading-relaxed">
            Wine collections outgrow spreadsheets quickly. A bottle has a producer, a
            vintage, a region, a price, a place in the rack — and, more importantly, a
            memory: who you drank it with, what it tasted like, whether you would buy it
            again.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            MyWine.info keeps all of that together. Your inventory, your tasting notes,
            your photographs of labels and corks, and an AI sommelier that can read your
            own notes back to you when you ask what to open tonight.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Everything is exportable as CSV. It is your cellar, and it stays your data.
          </p>
          <Button asChild variant="outline">
            <Link href="/learn-more">See the full feature list</Link>
          </Button>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">Support the project</h2>
          <p className="text-muted-foreground leading-relaxed">
            MyWine.info is free. If you find it useful and want to help cover hosting and
            AI costs, a crypto donation is very welcome.
          </p>
          <DonationCards />
        </section>
      </div>
    </Layout>
  );
}
