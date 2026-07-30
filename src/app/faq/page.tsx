import type { Metadata } from 'next';
import Link from 'next/link';

import Layout from '@/components/layout/Layout';
import { PageHeading } from '@/components/layout/PageHeading';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Common questions about tracking your wine collection with MyWine.info.',
};

const FAQ_ITEMS = [
  {
    id: 'what-is-it',
    question: 'What is MyWine.info and how does it work?',
    answer:
      'It is a digital cellar book. Create an account, add your wines, and from there you can track inventory, write tasting notes, upload photos of labels and corks, and generate AI summaries about any bottle in your collection.',
  },
  {
    id: 'add-wine',
    question: 'How do I add a wine?',
    answer:
      'Open your Wine Cellar and choose "Add wine". Only the name is required — producer, region, vintage, bottle size, price and quantity are all optional and can be filled in later. Selecting a wine from the list opens its detail view, where you can rate it, write notes, add photos and request an AI summary.',
  },
  {
    id: 'price',
    question: 'Is it free?',
    answer:
      'Yes. Every feature is available without a subscription. Donations help cover hosting and AI costs but are entirely optional.',
  },
  {
    id: 'ai-summary',
    question: 'How does the AI summary work?',
    answer:
      'The AI uses the wine name and producer you entered to generate background on the wine — its characteristics, its history and what makes it distinctive. Treat it as a starting point for your own notes rather than an authority.',
  },
  {
    id: 'ai-chat',
    question: 'How does the AI sommelier chat work?',
    answer:
      'The chat has access to your collection, so it can answer questions about the wines you actually own and search the notes you have written. It is at its best for food pairings and "what should I open" questions. For anything numeric, trust the dashboard rather than the chat.',
  },
  {
    id: 'privacy',
    question: 'Is my data private?',
    answer:
      'Your data is stored securely and your email address is never shared with third parties. You can export or delete your collection at any time. Note that there is currently no backup service — if you lose access to your account we cannot restore it, so export a CSV occasionally. Please also read the legal disclaimer.',
  },
  {
    id: 'csv',
    question: 'Can I import and export my collection?',
    answer:
      'Yes, both, as CSV. Export to keep a backup or to edit your collection offline in a spreadsheet, then import the file to bring the changes back.',
  },
];

export default function FAQPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <PageHeading
          title="Frequently asked questions"
          description="Everything people usually want to know before they start."
        />

        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-left text-base">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Still stuck?</p>
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link href="/learn-more">Learn more</Link>
            </Button>
            <Button asChild>
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
