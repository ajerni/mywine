'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo } from 'react';

interface NavLinkProps {
  href: string;
  label: string;
  className?: string;
}

export const NavLink = memo(function NavLink({ href, label, className }: NavLinkProps) {
  const pathname = usePathname();
  
  return (
    <Link
      href={href}
      className={`transition-colors duration-200 ${className || 'text-white hover:text-gray-300'}`}
      prefetch={false}
    >
      {label}
    </Link>
  );
});

NavLink.displayName = 'NavLink'; 