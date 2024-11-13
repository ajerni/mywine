'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { User } from "@/app/wine-cellar/types";
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useCallback, useMemo, memo } from 'react';
import { GetProNote } from "@/components/GetProNote";
import { NavLink } from '@/components/layout/NavLink';
import { logoutUser } from '@/app/auth/authHandlers';

interface HeaderProps {
  user: User | null;
  isEditingOrAdding?: boolean;
}

export const Header = memo(function Header({ user, isEditingOrAdding = false }: HeaderProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logoutUser();
    router.push('/login');
  }, [router]);

  const handleProClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsProModalOpen(true);
  }, []);

  const handleNavClick = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  const desktopNavLinks = useMemo(() => (
    <nav className="ml-12 flex gap-6">
      {user && (
        <>
          <NavLink href="/wine-cellar" label="Wine Cellar" />
          <NavLink href="/wine-cellar/data" label="Download & Upload Data" />
        </>
      )}
      <NavLink href="/" label="Home" />
      <NavLink href="/about" label="About" />
      <NavLink href="/contact" label="Contact" />
      <NavLink href="/faq" label="FAQ" />
    </nav>
  ), [user]);

  const mobileNavLinks = useMemo(() => (
    <nav className="flex flex-col gap-4" onClick={handleNavClick}>
      {user && (
        <>
          <NavLink href="/wine-cellar" label="Wine Cellar" />
          <NavLink href="/wine-cellar/data" label="Download & Upload Data" />
        </>
      )}
      <NavLink href="/" label="Home" />
      <NavLink href="/about" label="About" />
      <NavLink href="/contact" label="Contact" />
      <NavLink href="/faq" label="FAQ" />
    </nav>
  ), [user, handleNavClick]);

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
              
              {/* Desktop Navigation */}
              {!isMobile && desktopNavLinks}
            </div>

            {/* Mobile Menu */}
            {isMobile ? (
              <div className="flex items-center gap-4">
                {user && (
                  <span className="text-white text-sm">Welcome {user.username}!</span>
                )}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent 
                    side="right" 
                    className="w-[300px] bg-black p-6"
                  >
                    <div className="flex flex-col gap-6">
                      {user && !user.has_proaccount && (
                        <button 
                          onClick={handleProClick}
                          className="text-blue-400 hover:text-blue-300 font-semibold text-left"
                        >
                          Upgrade to Pro
                        </button>
                      )}
                      {mobileNavLinks}
                      {user && (
                        <Button 
                          onClick={handleLogout}
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700 text-white hover:text-black w-full"
                        >
                          Logout
                        </Button>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            ) : (
              user && !isEditingOrAdding && (
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
                  <Button 
                    onClick={handleLogout} 
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white hover:text-black"
                  >
                    Logout
                  </Button>
                </div>
              )
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

Header.displayName = 'Header';