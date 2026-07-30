import Link from 'next/link';
import { Home, Search } from 'lucide-react';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <Layout>
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <p className="font-display text-primary text-6xl font-semibold">404</p>
        <h1 className="font-display mt-4 text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          This bottle is missing from the cellar. Let&apos;s get you back to a page that exists.
        </p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <Home />
              Back home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/wine-cellar">
              <Search />
              Your cellar
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}
