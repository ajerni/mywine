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
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);
  
  return (
    <div className={`min-h-screen bg-black relative ${isIOS ? 'ios-main-layout' : ''}`}>
      <header className="fixed top-0 left-0 right-0 z-40 bg-black h-20">
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

            {/* Welcome text */}
            <div className="text-white text-sm sm:text-base">
              Welcome andiernie!
            </div>

            {/* Menu button for mobile */}
            <button className="text-white md:hidden ios-button">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {children}

      <footer className="fixed bottom-0 left-0 right-0 bg-black text-white z-40 py-2 px-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>© 2024 MyWine.info</div>
          <div>Legal Disclaimer</div>
        </div>
      </footer>
    </div>
  );
}
