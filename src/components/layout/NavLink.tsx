'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo } from 'react';

interface NavLinkProps {
  href: string;
  label: string;
  className?: string;
  onClick?: () => void;
}

export const NavLink = memo(function NavLink({ href, label, className, onClick }: NavLinkProps) {
  const pathname = usePathname();
  
  return (
    <Link
      href={href}
      className={`touch-manipulation -webkit-tap-highlight-color-transparent ${className || 'text-white hover:text-gray-300'}`}
      prefetch={false}
      onClick={onClick}
    >
      {label}
    </Link>
  );
});

NavLink.displayName = 'NavLink'; 