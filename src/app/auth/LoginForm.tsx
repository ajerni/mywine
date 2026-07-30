'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

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
import { PasswordInput } from '@/components/ui/password-input';
import { getCurrentUser, loginUser } from './authHandlers';

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Enter your username'),
  password: z.string().min(1, 'Enter your password'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get('next');
  const [error, setError] = useState('');
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async ({ username, password }) => {
    setError('');
    const result = await loginUser(username, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    const user = await getCurrentUser();
    if (user) localStorage.setItem('user', JSON.stringify(user));
    // Reject anything but a same-origin path — `//evil.com` is protocol-relative
    // and would otherwise bounce the user off-site.
    const isSafeNext = next !== null && next.startsWith('/') && !next.startsWith('//');
    router.push(isSafeNext ? next : '/wine-cellar');
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        )}

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="username" autoCapitalize="none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput {...field} autoComplete="current-password" />
              </FormControl>
              <FormMessage />
              <Link
                href="/recover-password"
                className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="animate-spin" />}
          {form.formState.isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </Form>
  );
}
