'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { User } from "@/app/wine-cellar/types";
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { GetProNote } from "@/components/GetProNote";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  isEditingOrAdding?: boolean;
}

const navLinks = [
  { href: '/wine-cellar', label: 'Wine Cellar' },
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
];

export function Header({ user, onLogout, isEditingOrAdding = false }: HeaderProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const handleNavClick = (href: string) => {
    if (pathname === href) {
      setIsSheetOpen(false);
    }
  };

  const handleProClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsProModalOpen(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-black text-white z-10 h-28">
        <div className="max-w-screen-2xl mx-auto h-full flex justify-between items-center">
          <div className="flex items-center gap-12 pl-4">
            <Link 
              href="/"
              className="h-20"
            >
              <img 
                src="/logolong3.png" 
                alt="Wine Cellar Logo" 
                className="h-full w-auto object-contain" 
              />
            </Link>
            
            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="flex gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-red-400 ${
                      pathname === link.href ? 'text-red-500' : 'text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* Right side content */}
          <div className="pr-4">
            {/* Always show menu on mobile, show user controls on desktop */}
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
                    <div className="flex flex-col gap-6">
                      {user && !user.has_proaccount && (
                        <button 
                          onClick={handleProClick}
                          className="text-blue-400 hover:text-blue-300 font-semibold text-left"
                        >
                          Upgrade to Pro
                        </button>
                      )}

                      {/* Mobile Navigation */}
                      <nav className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => handleNavClick(link.href)}
                            className={`text-base font-medium transition-colors hover:text-red-400 ${
                              pathname === link.href ? 'text-red-500' : 'text-zinc-900'
                            }`}
                          >
                            {link.label}
                          </Link>
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
                    <span className="text-white inline-flex items-center">Welcome {user.username}!</span>
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