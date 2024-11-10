import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { User } from "@/app/wine-cellar/types";
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  isEditingOrAdding?: boolean;
}

export function Header({ user, onLogout, isEditingOrAdding = false }: HeaderProps) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <header className="fixed top-0 left-0 right-0 bg-black text-white z-10 h-28">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 h-full flex justify-between items-center">
        <Link 
          href="/"
          className="h-20 w-20"
        >
            <img 
              src="/wineinfologo_new.png" 
              alt="Wine Cellar Logo" 
              className="h-full w-full" 
            />
        </Link>
        {user && !isEditingOrAdding && (
          <>
            {/* Mobile Layout */}
            {isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] bg-black p-6">
                  <div className="flex flex-col gap-4">
                    {!user.has_proaccount && (
                      <Link 
                        href="/upgrade"
                        className="text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        Upgrade to Pro
                      </Link>
                    )}
                    <span className="text-white">Welcome {user.username}!</span>
                    <Button 
                      onClick={onLogout} 
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 text-white hover:text-black w-full"
                    >
                      Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              /* Desktop Layout */
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                  {!user.has_proaccount && (
                    <Link 
                      href="/upgrade"
                      className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center"
                    >
                      Upgrade to Pro
                    </Link>
                  )}
                  <span className="text-white inline-flex items-center">Welcome {user.username}!</span>
                </div>
                <Button 
                  onClick={onLogout} 
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white hover:text-black"
                >
                  Logout
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}
