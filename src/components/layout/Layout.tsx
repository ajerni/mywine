import Link from 'next/link';
import Image from 'next/image';
import { DisclaimerModal } from "@/components/modals/DisclaimerModal";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-black text-red-500 font-[family-name:var(--font-geist-sans)]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/mywinelogo.png"
                alt="Wine Cellar logo"
                width={150}
                height={32}
                priority
                className="h-8 w-auto"
              />
            </Link>
            <nav className="hidden sm:flex space-x-8">
              <Link 
                href="/" 
                className="text-red-400 hover:text-red-300 transition-colors duration-300"
              >
                Home
              </Link>
              <Link 
                href="/about" 
                className="text-red-400 hover:text-red-300 transition-colors duration-300"
              >
                About Us
              </Link>
              <Link 
                href="/contact" 
                className="text-red-400 hover:text-red-300 transition-colors duration-300"
              >
                Contact
              </Link>
              <Link 
                href="/faq" 
                className="text-red-400 hover:text-red-300 transition-colors duration-300"
              >
                FAQ
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-20">
        {children}
      </main>

      <footer className="py-8 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4">
            
            <div className="flex items-center gap-4 text-sm text-red-400">
              <span>© {new Date().getFullYear()} MyWine.info</span>
              <span>•</span>
              <DisclaimerModal>
                <button className="hover:text-red-300 transition-colors duration-300">
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