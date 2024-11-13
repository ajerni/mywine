'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo } from 'react';

interface NavLinkProps {
  href: string;
  label: string;
}

export const NavLink = memo(function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  
  return (
    <Link
      href={href}
      className={`text-sm font-medium ${
        pathname === href ? 'text-red-500' : 'text-red-400'
      } hover:text-red-300 transition-colors duration-300`}
      prefetch={false}
    >
      {label}
    </Link>
  );
});

NavLink.displayName = 'NavLink'; 