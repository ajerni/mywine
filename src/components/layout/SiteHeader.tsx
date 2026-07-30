'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Menu, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { GetProNote } from '@/components/GetProNote';
import { cn } from '@/lib/utils';
import type { User } from '@/app/wine-cellar/types';

const CELLAR_LINKS = [
  { href: '/wine-cellar', label: 'Wine Cellar' },
  { href: '/wine-cellar/dashboard', label: 'Dashboard' },
  { href: '/wine-cellar/data', label: 'Import & Export' },
] as const;

const SITE_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
] as const;

interface SiteHeaderProps {
  user: User | null;
  isLoadingUser: boolean;
  onLogout: () => void;
}

function Brand() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-md">
      <span className="relative size-9">
        <Image
          src="/logo_black_transparent.png"
          alt=""
          fill
          sizes="36px"
          priority
          className="object-contain dark:hidden"
        />
        <Image
          src="/logo_color_transparent.png"
          alt=""
          fill
          sizes="36px"
          priority
          className="hidden object-contain dark:block"
        />
      </span>
      <span className="font-display text-xl leading-none font-semibold tracking-tight">
        MyWine<span className="text-primary">.info</span>
      </span>
    </Link>
  );
}

function NavItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-secondary text-secondary-foreground'
          : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
      )}
    >
      {label}
    </Link>
  );
}

export function SiteHeader({ user, isLoadingUser, onLogout }: SiteHeaderProps) {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isProOpen, setIsProOpen] = useState(false);

  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const visibleLinks = user ? [...CELLAR_LINKS, ...SITE_LINKS] : SITE_LINKS;

  return (
    <>
      <header className="bg-background/80 supports-[backdrop-filter]:bg-background/65 sticky top-0 z-50 border-b backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
          <Brand />

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {user && (
              <>
                {CELLAR_LINKS.map((link) => (
                  <NavItem key={link.href} {...link} active={isActive(link.href)} />
                ))}
                <Separator orientation="vertical" className="mx-2 !h-5" />
              </>
            )}
            {SITE_LINKS.map((link) => (
              <NavItem key={link.href} {...link} active={isActive(link.href)} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />

            {isLoadingUser ? (
              <Skeleton className="h-9 w-24 rounded-md" />
            ) : user ? (
              <div className="hidden lg:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {user.username}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <span className="text-muted-foreground block text-xs">
                        Signed in as
                      </span>
                      <span className="truncate font-medium">{user.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {!user.has_proaccount && (
                      <DropdownMenuItem onSelect={() => setIsProOpen(true)}>
                        <Sparkles className="text-accent" />
                        Upgrade to Pro
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem variant="destructive" onSelect={onLogout}>
                      <LogOut />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Create account</Link>
                </Button>
              </div>
            )}

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(20rem,85vw)]">
                <SheetHeader className="border-b">
                  <SheetTitle className="font-display text-lg">
                    {user ? `Hello, ${user.username}` : 'Menu'}
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1 overflow-y-auto p-4">
                  {visibleLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={isActive(link.href) ? 'page' : undefined}
                        className={cn(
                          'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive(link.href)
                            ? 'bg-secondary text-secondary-foreground'
                            : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>

                <div className="mt-auto flex flex-col gap-2 border-t p-4">
                  {user ? (
                    <>
                      {!user.has_proaccount && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsSheetOpen(false);
                            setIsProOpen(true);
                          }}
                        >
                          <Sparkles className="text-accent" />
                          Upgrade to Pro
                        </Button>
                      )}
                      <Button variant="destructive" onClick={onLogout}>
                        <LogOut />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button asChild>
                          <Link href="/register">Create account</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button asChild variant="outline">
                          <Link href="/login">Sign in</Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <GetProNote isOpen={isProOpen} onClose={() => setIsProOpen(false)} />
    </>
  );
}
