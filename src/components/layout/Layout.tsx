"use client";

import { useEffect, useState } from 'react';
import { User } from '@/app/wine-cellar/types';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { getCurrentUser, logoutUser } from '@/app/auth/authHandlers';
import Link from 'next/link';
import { DisclaimerModal } from '../modals/DisclaimerModal';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const hideFooter = pathname === "/login" || pathname === "/register";

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 80);
  }, []);

  return (
    <div className="min-h-screen bg-black relative">
      <Header 
        user={user} 
        onLogout={handleLogout}
        isEditingOrAdding={false}
      />

      <main className="pt-32 pb-24 sm:pb-28 min-h-screen overflow-y-auto relative z-0">
        {children}
      </main>

      {!hideFooter && (
        <footer className="fixed bottom-0 left-0 right-0 h-16 bg-black z-[9999]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
            <div className="flex items-center gap-4 text-sm text-red-500">
              <span>© {new Date().getFullYear()} MyWine.info</span>
              <span>•</span>
              <DisclaimerModal>
                <button className="hover:text-red-400 transition-colors footer-text">
                  Legal Disclaimer
                </button>
              </DisclaimerModal>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}