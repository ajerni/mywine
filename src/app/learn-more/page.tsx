import type { Metadata } from 'next';
import Link from 'next/link';
import { Camera, ClipboardList, Cpu, LineChart, MessageSquareText, Sparkles } from 'lucide-react';

import Layout from '@/components/layout/Layout';
import { PageHeading } from '@/components/layout/PageHeading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Inventory, tasting notes, photos, AI summaries and cellar analytics — everything MyWine.info does.',
};

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Inventory',
    description: 'Know exactly what is in the rack',
    points: [
      'Track quantities and bottle sizes',
      'Organise by producer, grape, country, region or vintage',
      'Search across your whole collection at once',
      'Sort and filter on any column',
    ],
  },
  {
    icon: MessageSquareText,
    title: 'Tasting notes',
    description: 'Remember more than the label',
    points: [
      'Write free-form notes per bottle',
      'Rate wines out of five stars',
      'Record food pairings that worked',
      'Search your own notes with AI',
    ],
  },
  {
    icon: Camera,
    title: 'Photos',
    description: 'A visual record of the cellar',
    points: [
      'Photograph labels and corks',
      'Several images per wine',
      'Uploaded straight from your phone',
      'Compressed automatically on upload',
    ],
  },
  {
    icon: Sparkles,
    title: 'AI summaries',
    description: 'Background on any bottle',
    points: [
      'Generated from the name and producer',
      'Characteristics, history and style',
      'Saved alongside the wine',
      'Regenerate whenever you like',
    ],
  },
  {
    icon: Cpu,
    title: 'AI sommelier',
    description: 'Ask your collection questions',
    points: [
      'Food pairing suggestions',
      'What to open tonight',
      'Searches the notes you wrote',
      'Available on pro accounts',
    ],
  },
  {
    icon: LineChart,
    title: 'Analytics & data',
    description: 'The shape of your cellar',
    points: [
      'Total bottles and estimated value',
      'Spread by country, grape and vintage',
      'CSV export for backups',
      'CSV import for bulk edits',
    ],
  },
];

export default function LearnMorePage() {
  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <PageHeading
          title="What MyWine.info does"
          description="A cellar book, a tasting journal and a sommelier, in one place."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description, points }) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2 text-lg">
                  <Icon className="text-primary size-5" aria-hidden />
                  {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  {points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="text-accent" aria-hidden>
                        •
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Button asChild size="lg">
            <Link href="/register">Start your collection</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
