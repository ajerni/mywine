import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell } from '@/components/auth/AuthShell';
import RegisterForm from '../auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a free MyWine.info account and start tracking your cellar.',
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Free, and your data stays yours."
      footer={
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-foreground font-medium underline underline-offset-4">
            Log in
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
