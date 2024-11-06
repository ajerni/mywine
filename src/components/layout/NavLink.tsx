'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function NavLink({ href, children, className = '', onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const linkClasses = `${className} ${
    isActive ? 'text-red-500' : 'text-red-400'
  } transition-colors duration-300 hover:text-red-300`;

  return (
    <Link
      href={href}
      className={linkClasses}
      onClick={(e) => {
        onClick?.();
      }}
    >
      {children}
    </Link>
  );
} 