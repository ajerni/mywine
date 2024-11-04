import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { User } from "@/app/wine-cellar/types";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  isEditingOrAdding?: boolean;
}

export function Header({ user, onLogout, isEditingOrAdding = false }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-green-600 text-white z-10 h-28">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 h-full flex justify-between items-center">
        <Link 
          href="/"
          className="h-20 w-20"
        >
          <img 
            src="/logo_black_transparent.png" 
            alt="Wine Cellar Logo" 
            className="h-full w-full" 
          />
        </Link>
        {user && !isEditingOrAdding && (
          <div className="flex items-center space-x-4">
            <span className="text-white">Welcome {user.username}!</span>
            <Button 
              onClick={onLogout} 
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 text-white hover:text-black"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
