'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { User } from "@/app/wine-cellar/types";
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from '@/hooks/useIsMobile';
import { useRouter } from 'next/navigation';
import { useState, useCallback, useMemo, memo } from 'react';
import { GetProNote } from "@/components/GetProNote";
import { NavLink } from '@/components/layout/NavLink';
import { logoutUser } from '@/app/auth/authHandlers';

interface HeaderProps {
  user: User | null;
  onLogout: () => Promise<void>;
  isEditingOrAdding: boolean;
}

const AUTH_NAVIGATION_ITEMS = [
  { href: '/wine-cellar', label: 'Wine Cellar', requiresAuth: true },
  { href: '/wine-cellar/dashboard', label: 'Dashboard', requiresAuth: true },
  { href: '/wine-cellar/data', label: 'Download & Upload Data', requiresAuth: true },
] as const;

const GENERAL_NAVIGATION_ITEMS = [
  { href: '/', label: 'Home', requiresAuth: false },
  { href: '/about', label: 'About', requiresAuth: false },
  { href: '/contact', label: 'Contact', requiresAuth: false },
  { href: '/faq', label: 'FAQ', requiresAuth: false }
] as const;

const UserControlsContent = memo(function UserControlsContent({
  username,
  hasProAccount,
  onProClick,
  onLogout
}: {
  username: string;
  hasProAccount: boolean;
  onProClick: (e: React.MouseEvent) => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex items-center gap-4">
      {!hasProAccount && (
        <button 
          onClick={onProClick}
          className="text-blue-400 hover:text-blue-300 font-semibold text-left"
        >
          Upgrade to Pro
        </button>
      )}
      <span className="text-white text-sm">Welcome {username}!</span>
      <Button 
        onClick={onLogout}
        variant="destructive"
        className="bg-red-600 hover:bg-red-700 text-white hover:text-black"
      >
        Logout
      </Button>
    </div>
  );
});

export const Header = memo(function Header({ user, onLogout, isEditingOrAdding = false }: HeaderProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logoutUser();
    router.push('/login');
  }, [router]);

  const handleProClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsProModalOpen(true);
  }, []);

  const navigationLinks = useMemo(() => {
    const authLinks = AUTH_NAVIGATION_ITEMS.map(item => {
      if (!user) {
        return <NavLink key={item.href} href="/login" label={item.label} />;
      }
      return <NavLink key={item.href} href={item.href} label={item.label} />;
    });

    const generalLinks = GENERAL_NAVIGATION_ITEMS.map(item => (
      <NavLink key={item.href} href={item.href} label={item.label} />
    ));

    return {
      authLinks,
      generalLinks
    };
  }, [user?.id]);

  const userControls = useMemo(() => {
    if (!user || isEditingOrAdding) return null;
    
    return (
      <UserControlsContent
        username={user.username}
        hasProAccount={user.has_proaccount}
        onProClick={handleProClick}
        onLogout={handleLogout}
      />
    );
  }, [user?.id, user?.username, user?.has_proaccount, isEditingOrAdding, handleProClick, handleLogout]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-black text-white z-10 h-28">
        <div className="max-w-screen-2xl mx-auto h-full">
          <div className="h-full flex justify-between items-center px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Link 
                href="/"
                className="flex items-center h-20 w-[200px] sm:w-[240px] -ml-3"
              >
                <div className="relative w-full h-full">
                  <img 
                    src="/logolong5.png" 
                    alt="Wine Cellar Logo" 
                    className="absolute top-0 left-0 h-full w-full object-contain" 
                    style={{
                      WebkitTransform: 'translateZ(0)',
                      transform: 'translateZ(0)',
                      maxHeight: '80px',
                      minHeight: '60px'
                    }}
                  />
                </div>
              </Link>
              
              {!isMobile && (
                <nav className="ml-12 flex items-center gap-6">
                  <div className="flex gap-6 items-center">
                    {navigationLinks.authLinks}
                  </div>
                  
                  <div className="h-6 w-px bg-zinc-700 mx-2" />
                  
                  <div className="flex gap-6 items-center">
                    {navigationLinks.generalLinks}
                  </div>
                </nav>
              )}
            </div>

            {isMobile ? (
              <div className="flex items-center gap-4">
                {user && <span className="text-white text-sm">Welcome {user.username}!</span>}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] bg-black p-6">
                    <div className="flex flex-col gap-6">
                      <nav className="flex flex-col">
                        <div className="flex flex-col gap-4 mb-4">
                          {navigationLinks.authLinks}
                        </div>
                        
                        <div className="h-px w-full bg-zinc-700 my-2" />
                        
                        <div className="flex flex-col gap-4 mt-4">
                          {navigationLinks.generalLinks}
                        </div>
                      </nav>
                      {userControls}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            ) : (
              userControls
            )}
          </div>
        </div>
      </header>
      
      <GetProNote 
        isOpen={isProModalOpen} 
        onClose={() => setIsProModalOpen(false)} 
      />
    </>
  );
});

UserControlsContent.displayName = 'UserControlsContent';
Header.displayName = 'Header';