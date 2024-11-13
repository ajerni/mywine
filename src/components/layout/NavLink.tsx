'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo } from 'react';

interface NavLinkProps {
  href: string;
  label: string;
  onClick?: () => void;
}

export const NavLink = memo(function NavLink({ href, label, onClick }: NavLinkProps) {
  const pathname = usePathname();
  
  const linkClasses = useMemo(() => {
    const isActive = pathname === href;
    return `text-sm font-medium ${
      isActive ? 'text-red-500' : 'text-red-400'
    } hover:text-red-300 transition-colors duration-300`;
  }, [pathname, href]);

  return (
    <Link
      href={href}
      className={linkClasses}
      onClick={onClick}
      prefetch={true}
    >
      {label}
    </Link>
  );
});

NavLink.displayName = 'NavLink'; 