'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { User } from "@/app/wine-cellar/types";
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  isEditingOrAdding?: boolean;
}

const navLinks = [
  { href: '/wine-cellar', label: 'Wine Cellar' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
];

function MobileNav() {
  return (
    <nav className="flex flex-col space-y-4">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-muted-foreground hover:text-primary"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function Header({ user, onLogout, isEditingOrAdding = false }: HeaderProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleNavClick = (href: string) => {
    if (pathname === href) {
      setIsSheetOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="mr-6 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <MobileNav />
          </SheetContent>
        </Sheet>
        
        {/* Welcome message */}
        <span className="mr-6 hidden text-white lg:block">Welcome {user?.email}!</span>
        <span className="mr-6 text-white lg:hidden">Welcome {user?.email}!</span>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex lg:space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-4">
            {user ? (
              <Button variant="ghost" onClick={onLogout}>
                Logout
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
