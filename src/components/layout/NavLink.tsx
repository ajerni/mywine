'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo } from 'react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const NavLink = memo(function NavLink({ 
  href, 
  children, 
  className = '', 
  onClick 
}: NavLinkProps) {
  const pathname = usePathname();
  
  // Memoize the active state and classes
  const { isActive, linkClasses } = useMemo(() => {
    const isActive = pathname === href;
    const linkClasses = `${className} ${
      isActive ? 'text-red-500' : 'text-red-400'
    } transition-colors duration-300 hover:text-red-300`;
    
    return { isActive, linkClasses };
  }, [pathname, href, className]);

  return (
    <Link
      href={href}
      className={linkClasses}
      onClick={onClick}
      prefetch={true}
    >
      {children}
    </Link>
  );
});

NavLink.displayName = 'NavLink'; 