'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { User } from "@/app/wine-cellar/types";
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePathname } from 'next/navigation';
import { useState, useCallback } from 'react';
import { GetProNote } from "@/components/GetProNote";

// Static navigation configuration
const ALL_NAV_LINKS = [
  { href: '/wine-cellar', label: 'Wine Cellar', requiresAuth: true },
  { href: '/wine-cellar/data', label: 'Download & Upload Data', requiresAuth: true },
  { href: '/', label: 'Home', requiresAuth: false },
  { href: '/about', label: 'About', requiresAuth: false },
  { href: '/contact', label: 'Contact', requiresAuth: false },
  { href: '/faq', label: 'FAQ', requiresAuth: false },
] as const;

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  isEditingOrAdding?: boolean;
}

// Simplified NavLink component
function NavLink({ href, children, className = '', onClick }: { 
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link
      href={href}
      className={`${className} ${
        isActive ? 'text-red-500' : 'text-red-400'
      } transition-colors duration-300 hover:text-red-300`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

// Simplified Desktop Navigation
function DesktopNav({ isAuthenticated }: { isAuthenticated: boolean }) {
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
}

// Simplified Mobile Navigation
function MobileNav({
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
}

export function Header({ user, onLogout, isEditingOrAdding = false }: HeaderProps) {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const handleNavClick = useCallback(() => setIsSheetOpen(false), []);
  const handleProClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsProModalOpen(true);
  }, []);

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
                <div className="ml-12">
                  <DesktopNav isAuthenticated={!!user} />
                </div>
              )}
            </div>

            {isMobile ? (
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
                    <MobileNav
                      isAuthenticated={!!user}
                      onNavClick={handleNavClick}
                      user={user}
                      onLogout={onLogout}
                      onProClick={handleProClick}
                    />
                  </SheetContent>
                </Sheet>
              </div>
            ) : (
              user && !isEditingOrAdding && (
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
}