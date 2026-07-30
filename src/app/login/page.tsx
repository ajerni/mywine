import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell } from '@/components/auth/AuthShell';
import LoginForm from '../auth/LoginForm';

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to your MyWine.info cellar.',
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Log in to reach your cellar."
      footer={
        <p className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-foreground font-medium underline underline-offset-4">
            Register
          </Link>
        </p>
      }
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
