'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { User } from "@/app/wine-cellar/types";
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePathname } from 'next/navigation';
import { useState, useMemo, useCallback } from 'react';
import { GetProNote } from "@/components/GetProNote";
import { NavLink } from '@/components/layout/NavLink';
import { memo } from 'react';

// Create a single constant for all possible nav links in the correct order
const ALL_NAV_LINKS = [
  { href: '/wine-cellar', label: 'Wine Cellar', requiresAuth: true },
  { href: '/wine-cellar/data', label: 'Download & Upload Data', requiresAuth: true },
  { href: '/', label: 'Home', requiresAuth: false },
  { href: '/about', label: 'About', requiresAuth: false },
  { href: '/contact', label: 'Contact', requiresAuth: false },
  { href: '/faq', label: 'FAQ', requiresAuth: false },
];

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  isEditingOrAdding?: boolean;
}

// Create a memoized NavLinks component
const DesktopNavLinks = memo(function DesktopNavLinks({ 
  isAuthenticated 
}: { 
  isAuthenticated: boolean 
}) {
  const links = ALL_NAV_LINKS.filter(link => 
    !link.requiresAuth || (link.requiresAuth && isAuthenticated)
  );

  return (
    <nav className="flex gap-6">
      {links.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          className="text-sm font-medium"
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
});

// Update MobileNavLinks to use the same pattern
const MobileNavLinks = memo(function MobileNavLinks({
  isAuthenticated,
  onNavClick,
  user,
  onLogout,
  onProClick
}: {
  isAuthenticated: boolean;
  onNavClick: () => void;
  user: User | null;
  onLogout: () => void;
  onProClick: (e: React.MouseEvent) => void;
}) {
  const links = ALL_NAV_LINKS.filter(link => 
    !link.requiresAuth || (link.requiresAuth && isAuthenticated)
  );

  return (
    <div className="flex flex-col gap-6">
      {user && !user.has_proaccount && (
        <button 
          onClick={onProClick}
          className="text-blue-400 hover:text-blue-300 font-semibold text-left"
        >
          Upgrade to Pro
        </button>
      )}

      <nav className="flex flex-col gap-4">
        {links.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            onClick={onNavClick}
            className="text-base font-medium"
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <Button 
          onClick={onLogout} 
          variant="destructive"
          className="bg-red-600 hover:bg-red-700 text-white hover:text-black w-full"
        >
          Logout
        </Button>
      )}
    </div>
  );
});

export function Header({ user, onLogout, isEditingOrAdding = false }: HeaderProps) {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const handleNavClick = useCallback(() => setIsSheetOpen(false), []);
  const handleProClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsProModalOpen(true);
  }, []);

  // Memoize the desktop navigation section
  const desktopNav = useMemo(() => {
    if (isMobile) return null;
    return (
      <div className="ml-12">
        <DesktopNavLinks isAuthenticated={!!user} />
      </div>
    );
  }, [isMobile, user]);

  // Memoize the mobile navigation section
  const mobileNav = useMemo(() => {
    if (!isMobile) return null;
    return (
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-white text-sm">Welcome {user.username}!</span>
        )}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] bg-black p-6">
            <MobileNavLinks
              isAuthenticated={!!user}
              onNavClick={handleNavClick}
              user={user}
              onLogout={onLogout}
              onProClick={handleProClick}
            />
          </SheetContent>
        </Sheet>
      </div>
    );
  }, [isMobile, user, isSheetOpen, handleNavClick, onLogout, handleProClick]);

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
              {desktopNav}
            </div>
            {mobileNav}
            {!isMobile && user && !isEditingOrAdding && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                  {!user.has_proaccount && (
                    <button 
                      onClick={handleProClick}
                      className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center"
                    >
                      Upgrade to Pro
                    </button>
                  )}
                  <span className="text-white inline-flex items-center">
                    Welcome {user.username}!
                  </span>
                </div>
                <Button 
                  onClick={onLogout} 
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white hover:text-black"
                >
                  Logout
                </Button>
              </div>
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
}