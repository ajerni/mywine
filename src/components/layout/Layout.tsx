import Link from 'next/link';
import Image from 'next/image';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from 'lucide-react';
import { NavLink } from './NavLink';
import { DisclaimerModal } from "@/components/modals/DisclaimerModal"
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User } from '@/app/wine-cellar/types';
import { useRouter } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isWineCellarRoute = pathname === '/wine-cellar';

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ' },
  ];

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const mobileNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ' },
    ...(isWineCellarRoute && user ? [{
      href: '#',
      label: 'Logout',
      onClick: handleLogout,
      className: 'text-red-500 hover:text-red-600'
    }] : [])
  ];

  useEffect(() => {
    // Check for user data on component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    // Scroll to a specific position on page load
    window.scrollTo(0, 80);
  }, []);

  return (
    <div className="min-h-screen relative bg-black">
      <header className="fixed top-0 left-0 right-0 z-40 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link 
              href="/wine-cellar" 
              className="flex-shrink-0 touch-manipulation"
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                WebkitTouchCallout: 'none'
              }}
            >
              <Image
                src="/logo_mywine_info2.png"
                alt="Wine Cellar logo"
                width={300}
                height={50}
                priority
                className="h-12 w-auto sm:h-16"
              />
            </Link>

            {/* User section - show on wine-cellar route */}
            {isWineCellarRoute && user && (
              <div className="flex items-center sm:absolute sm:left-1/2 sm:-translate-x-1/2 mr-4 sm:mr-0">
                <span className="text-white text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                  Welcome {user.username}!
                </span>
                {/* Only show logout button on desktop */}
                <Button 
                  onClick={handleLogout} 
                  variant="destructive"
                  className="hidden sm:flex ml-4 bg-red-600 hover:bg-red-700 text-white hover:text-black"
                >
                  Logout
                </Button>
              </div>
            )}

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
                <Button variant="ghost" size="icon" className="text-red-500">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black/95 text-red-500 border-red-500/20">
                <nav className="flex flex-col space-y-4 mt-8">
                  {mobileNavLinks.map((link) => (
                    <div key={link.href}>
                      {link.onClick ? (
                        <button
                          onClick={link.onClick}
                          className={`text-lg w-full text-left ${link.className || ''}`}
                        >
                          {link.label}
                        </button>
                      ) : (
                        <NavLink href={link.href} className={`text-lg ${link.className || ''}`}>
                          {link.label}
                        </NavLink>
                      )}
                    </div>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="layout-content pt-24">
        {children}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-red-500">
              <span>© {new Date().getFullYear()} MyWine.info</span>
              <span>•</span>
              <DisclaimerModal>
                <button 
                  className="hover:text-red-400 transition-colors duration-300 touch-manipulation"
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    cursor: 'pointer'
                  }}
                >
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

