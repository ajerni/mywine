'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import Layout from '@/components/layout/Layout';
import { PageHeading } from '@/components/layout/PageHeading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getCurrentUser } from '@/app/auth/authHandlers';
import { ContactForm } from './ContactForm';

export default function ContactPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((user) => {
      if (!cancelled) setIsLoggedIn(Boolean(user));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      <div className="mx-auto max-w-xl px-4 py-12">
        <PageHeading title="Contact us" description="A question, a bug, or an idea — we read everything." />

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Send us a message</CardTitle>
            <CardDescription>
              {isLoggedIn === false
                ? 'Log in first so we know which account to reply about.'
                : "We'll get back to you as soon as we can."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoggedIn === null ? (
              <div className="space-y-4" aria-busy>
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : isLoggedIn ? (
              <ContactForm />
            ) : (
              <div className="flex flex-col items-start gap-4">
                <p className="text-muted-foreground text-sm">
                  You need an account to use this form.
                </p>
                <div className="flex gap-2">
                  <Button asChild>
                    <Link href="/login?next=/contact">Log in</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/register">Register</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
