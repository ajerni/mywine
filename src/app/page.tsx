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
    <div className="flex flex-col min-h-screen bg-black text-red-500 font-[family-name:var(--font-geist-sans)]">
      <header className={cn(
        "flex justify-center w-full",
        isIOS ? "pt-[calc(env(safe-area-inset-top)+2.5rem)]" : "pt-10"
      )}>
        <Image
          src="/mywinelogo.png"
          alt="Wine Cellar logo"
          width={300}
          height={63}
          priority
          className={cn(
            "max-w-[80%] h-auto",
            isIOS ? "m-3" : "m-5"
          )}
        />
      </header>
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <h1 className={cn(
          "font-bold text-center",
          isIOS ? "text-4xl mb-4" : "text-5xl mb-6"
        )}>
          Welcome to Your Wine Cellar
        </h1>
        <h2 className={cn(
          "text-center",
          isIOS ? "text-xl mb-8" : "text-2xl mb-12"
        )}>
          Track and manage your wine collection effortlessly
        </h2>
        
        <div className={cn(
          "flex gap-6",
          isIOS ? "flex-col w-full px-6" : "flex-col sm:flex-row"
        )}>
          <button
            className={cn(
              "rounded-full border-2 border-green-500 text-green-500 py-3 px-8 text-lg font-semibold flex items-center justify-center",
              isIOS ? "w-full ios-touch-target" : "hover:bg-green-500 hover:text-black transition-colors duration-300",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-green-500"
            )}
            onClick={() => {
              setIsLoading(true);
              window.location.href = '/wine-cellar';
            }}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Login"}
          </button>
          <a
            className={cn(
              "rounded-full border-2 border-red-500 text-red-500 py-3 px-8 text-lg font-semibold flex items-center justify-center",
              isIOS ? "w-full ios-touch-target" : "hover:bg-red-500 hover:text-white transition-colors duration-300"
            )}
            href="/learn-more"
          >
            Learn More
          </a>
        </div>
      </main>
      <footer className={cn(
        "py-8",
        isIOS && "pb-[calc(env(safe-area-inset-bottom)+2rem)]"
      )}>
        <div className="flex justify-center gap-8">
          <a
            className={cn(
              "text-red-400",
              isIOS ? "ios-touch-target" : "hover:text-red-300 transition-colors duration-300"
            )}
            href="/about"
          >
            About Us
          </a>
          <a
            className={cn(
              "text-red-400",
              isIOS ? "ios-touch-target" : "hover:text-red-300 transition-colors duration-300"
            )}
            href="/contact"
          >
            Contact
          </a>
          <a
            className={cn(
              "text-red-400",
              isIOS ? "ios-touch-target" : "hover:text-red-300 transition-colors duration-300"
            )}
            href="/faq"
          >
            FAQ
          </a>
        </div>
      </footer>
    </div>
  );
}
