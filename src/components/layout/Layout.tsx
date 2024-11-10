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
import { Header } from '@/components/Header';
import { getCurrentUser, logoutUser } from '@/app/auth/authHandlers';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isWineCellarRoute = pathname === '/wine-cellar';
  const [isNavOpen, setIsNavOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ' },
  ];

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
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
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    // Scroll to a specific position on page load
    window.scrollTo(0, 80);
  }, []);

  const handleNavClick = (onClick?: () => void) => {
    setIsNavOpen(false);
    onClick?.();
  };

  return (
    <div className="min-h-screen bg-black relative">
      <Header 
        user={user} 
        onLogout={handleLogout}
        isEditingOrAdding={false}
      />

      <main className="pt-32 pb-24 sm:pb-28 min-h-screen overflow-y-auto relative z-0">
        {children}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-black z-[9999]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <div className="flex items-center gap-4 text-sm text-red-500 footer-text">
            <span>© {new Date().getFullYear()} MyWine.info</span>
            <span>•</span>
            <DisclaimerModal>
              <button 
                className="hover:text-red-400 transition-colors duration-300 touch-manipulation text-sm"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  cursor: 'pointer',
                  fontSize: 'inherit'
                }}
              >
                Legal Disclaimer
              </button>
            </DisclaimerModal>
          </div>
        </div>
      </footer>
    </div>
  );
}