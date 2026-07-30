"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { getCurrentUser, logoutUser } from '@/app/auth/authHandlers';
import type { User } from '@/app/wine-cellar/types';

interface LayoutProps {
  children: React.ReactNode;
  /** Pages that manage their own full-height scroll area, e.g. the wine cellar. */
  hideFooter?: boolean;
}

export default function Layout({ children, hideFooter = false }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingUser(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
      <SiteHeader
        user={user}
        isLoadingUser={isLoadingUser}
        onLogout={handleLogout}
      />
      <main className="min-w-0">{children}</main>
      {hideFooter ? <div /> : <SiteFooter />}
    </div>
  );
}
