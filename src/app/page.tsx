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
      isIOS && "min-h-[-webkit-fill-available] ios-preserve-bg ios-safe-min-h"
    )}>
      <main className={cn(
        "flex-grow flex flex-col items-center justify-center px-4",
        isIOS && "ios-main-padding"
      )}>
        {/* Logo Section */}
        <div className={cn(
          "mb-16",
          isIOS && "ios-logo-spacing"
        )}>
          <Image
            src="/mywinelogo.png"
            alt="Wine Cellar logo"
            width={200}
            height={200}
            priority
            className="w-auto h-auto"
          />
        </div>

        {/* Text Content */}
        <h1 className={cn(
          "text-5xl font-bold text-center mb-4",
          isIOS && "ios-text-sizing"
        )}>
          Welcome to Your Wine Cellar
        </h1>
        <p className={cn(
          "text-xl text-center mb-16",
          isIOS && "ios-text-spacing"
        )}>
          Track and manage your wine collection effortlessly
        </p>

        {/* Buttons */}
        <div className={cn(
          "flex flex-col w-full max-w-xs gap-4",
          isIOS && "ios-button-container"
        )}>
          <button
            className={cn(
              "w-full rounded-full bg-transparent border-2 border-green-500 text-green-500 py-4 px-8 text-lg font-semibold",
              !isIOS && "hover:bg-green-500 hover:text-white transition-colors duration-300",
              isIOS && "ios-button ios-touch-target"
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
              isIOS && "ios-button ios-touch-target"
            )}
          >
            Learn More
          </a>
        </div>
      </main>

      <footer className={cn(
        "py-8",
        isIOS && "ios-footer"
      )}>
        <div className="flex justify-center gap-8 text-sm">
          <a href="/about" className="text-red-500">About Us</a>
          <a href="/faq" className="text-red-500">FAQ</a>
        </div>
      </footer>
    </div>
  );
}
