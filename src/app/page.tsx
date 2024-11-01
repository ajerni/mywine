"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
  }, []);

  return (
    <div className={cn(
      "flex flex-col min-h-screen bg-black text-red-500",
      isIOS && "min-h-[-webkit-fill-available] ios-preserve-bg"
    )}>
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        {/* Logo Section */}
        <div className="mb-16">
          <Image
            src="/mywinelogo.png"
            alt="Wine Cellar logo"
            width={200}
            height={200}
            priority
            className={cn(
              "w-auto h-auto",
              isIOS && "ios-touch-target"
            )}
          />
        </div>

        {/* Text Content */}
        <h1 className="text-5xl font-bold text-center mb-4">
          Welcome to Your Wine Cellar
        </h1>
        <p className="text-xl text-center mb-16">
          Track and manage your wine collection effortlessly
        </p>

        {/* Buttons */}
        <div className="flex flex-col w-full max-w-xs gap-4">
          <button
            className={cn(
              "w-full rounded-full bg-transparent border-2 border-green-500 text-green-500 py-4 px-8 text-lg font-semibold",
              !isIOS && "hover:bg-green-500 hover:text-white transition-colors duration-300",
              isIOS && "ios-touch-target active:opacity-70"
            )}
            onClick={() => {
              setIsLoading(true);
              window.location.href = '/login';
            }}
            disabled={isLoading}
          >
            Login
          </button>
          <a
            href="/learn-more"
            className={cn(
              "w-full rounded-full bg-transparent border-2 border-red-500 text-red-500 py-4 px-8 text-lg font-semibold text-center",
              !isIOS && "hover:bg-red-500 hover:text-white transition-colors duration-300",
              isIOS && "ios-touch-target active:opacity-70"
            )}
          >
            Learn More
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8">
        <div className="flex justify-center gap-8 text-sm">
          <a 
            href="/about" 
            className={cn(
              "text-red-500",
              isIOS && "ios-touch-target active:opacity-70"
            )}
          >
            About Us
          </a>
          <a 
            href="/faq" 
            className={cn(
              "text-red-500",
              isIOS && "ios-touch-target active:opacity-70"
            )}
          >
            FAQ
          </a>
        </div>
      </footer>
    </div>
  );
}
