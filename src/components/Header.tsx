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

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  isEditingOrAdding?: boolean;
}

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  
  return (
    <Link
      href={href}
      className={`text-sm font-medium ${
        pathname === href ? 'text-red-500' : 'text-red-400'
      } hover:text-red-300 transition-colors duration-300`}
    >
      {label}
    </Link>
  );
}

export function Header({ user, onLogout, isEditingOrAdding = false }: HeaderProps) {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const handleProClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsProModalOpen(true);
  }, []);

  const handleNavClick = useCallback(() => {
    setIsSheetOpen(false);
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
              
              {/* Desktop Navigation */}
              {!isMobile && (
                <nav className="ml-12 flex gap-6">
                  {/* Auth Links */}
                  {user && (
                    <>
                      <NavLink href="/wine-cellar" label="Wine Cellar" />
                      <NavLink href="/wine-cellar/data" label="Download & Upload Data" />
                    </>
                  )}
                  {/* Public Links - Always visible */}
                  <NavLink href="/" label="Home" />
                  <NavLink href="/about" label="About" />
                  <NavLink href="/contact" label="Contact" />
                  <NavLink href="/faq" label="FAQ" />
                </nav>
              )}
            </div>

            {/* Mobile Menu */}
            {isMobile ? (
              <div className="flex items-center gap-4">
                {user && (
                  <span className="text-white text-sm">Welcome {user.username}!</span>
                )}
                <Sheet 
                  open={isSheetOpen} 
                  onOpenChange={setIsSheetOpen}
                >
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent 
                    side="right" 
                    className="w-[300px] bg-black p-6"
                    onCloseAutoFocus={(e) => e.preventDefault()}
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
                      {user && (
                        <Button 
                          onClick={() => {
                            handleNavClick();
                            onLogout();
                          }}
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