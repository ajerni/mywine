'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Loader2 } from 'lucide-react';

import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
});

export default function RecoverPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setError('');
    try {
      const response = await fetch('/api/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? 'Could not send the recovery email.');
        return;
      }
      setIsSubmitted(true);
    } catch {
      setError('Could not send the recovery email.');
    }
  });

  return (
    <AuthShell
      title="Recover your password"
      description="We'll email you a link to set a new one."
      footer={
        <p className="text-muted-foreground text-center text-sm">
          <Link href="/login" className="text-foreground font-medium underline underline-offset-4">
            Back to log in
          </Link>
        </p>
      }
    >
      {isSubmitted ? (
        <div className="flex gap-3 text-sm" role="status">
          <CheckCircle2 className="text-accent mt-0.5 size-5 shrink-0" />
          <p>
            If an account exists for that address, reset instructions are on their way.
            The link expires in one hour.
          </p>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" autoComplete="email" placeholder="you@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
              {form.formState.isSubmitting ? 'Sending…' : 'Send recovery email'}
            </Button>
          </form>
        </Form>
      )}
    </AuthShell>
  );
}
