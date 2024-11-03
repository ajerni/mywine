import Link from 'next/link';
import Image from 'next/image';
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DisclaimerModal } from "@/components/modals/DisclaimerModal";

interface LayoutProps {
  children: React.ReactNode;
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

function NavLink({ href, children, className }: NavLinkProps) {
  return (
    <Link 
      href={href} 
      className={`text-red-400 hover:text-red-300 transition-colors duration-300 ${className}`}
    >
      {children}
    </Link>
  );
}

export default function Layout({ children }: LayoutProps) {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-red-500 font-[family-name:var(--font-geist-sans)]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo_mywine_info2.png"
                alt="Wine Cellar logo"
                width={300}
                height={50}
                priority
                className="h-16 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex space-x-8">
              {navLinks.map((link) => (
                <NavLink key={link.href} href={link.href}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild className="sm:hidden">
                <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-black/95 border-red-900">
                <nav className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link) => (
                    <NavLink 
                      key={link.href} 
                      href={link.href}
                      className="text-lg px-4 py-2 -mx-4 hover:bg-red-950/50 rounded-lg"
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-20">
        {children}
      </main>

      <footer className="py-8 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-red-400">
              <span>© {new Date().getFullYear()} MyWine.info</span>
              <span>•</span>
              <DisclaimerModal>
                <button className="hover:text-red-300 transition-colors duration-300">
                  Legal Disclaimer
                </button>
              </DisclaimerModal>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 


