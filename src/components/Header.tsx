import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { User } from "@/app/wine-cellar/types";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  hideControls?: boolean; // Add this new prop
}

export function Header({ user, onLogout, hideControls = false }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-background z-10 p-4 flex justify-between items-center min-h-12 mb-4 pb-4">
      <img src="/mywinelogo_white.png" alt="Wine Cellar Logo" className="h-12 w-auto p-4" style={{ width: '120px', height: '120px' }} />
      {user && !hideControls ? ( // Add hideControls condition
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <span>Welcome, {user.username}!</span>
            <Button onClick={onLogout} variant="destructive">
              Logout
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
