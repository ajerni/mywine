import Link from 'next/link';
import { DisclaimerModal } from '@/components/modals/DisclaimerModal';

export function SiteFooter() {
  return (
    <footer className="bg-card border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm sm:flex-row sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} MyWine.info</p>
        <nav className="flex items-center gap-5">
          <Link href="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
          <DisclaimerModal>
            <button className="hover:text-foreground transition-colors">
              Legal disclaimer
            </button>
          </DisclaimerModal>
        </nav>
      </div>
    </footer>
  );
}
