"use client";

import Image from "next/image";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  // Add helper for iOS detection
  const isIOS = () => {
    return /iPhone|iPad|iPod/.test(navigator.userAgent);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-5rem)] bg-black mt-[-80px] py-8 sm:py-0">
        <Image
          src="/mywinelogo.png"
          alt="Wine Cellar logo"
          width={250}
          height={60}
          priority
          className="mb-8 sm:mb-12 mt-12 sm:mt-0"
        />
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 sm:mb-6 text-center text-red-500">Welcome to Your Wine Cellar</h1>
        <h2 className="text-xl sm:text-2xl mb-8 sm:mb-12 text-center text-red-500">Track and manage your wine collection effortlessly</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8 sm:mb-0 w-full max-w-[280px] sm:max-w-md px-4">
          <Link
            href="/wine-cellar"
            className={`w-full sm:w-40 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-colors duration-300 py-3 px-4 sm:px-8 text-lg font-semibold flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${isIOS() ? 'touch-manipulation' : ''}`}
            style={isIOS() ? { 
              WebkitTapHighlightColor: 'transparent',
              WebkitAppearance: 'none',
              WebkitTransform: 'translateZ(0)',
              transform: 'translateZ(0)'
            } : undefined}
            onClick={() => setIsLoading(true)}
          >
            {isLoading ? "Loading..." : "Login"}
          </Link>
          <Link
            href="/learn-more"
            className={`w-full sm:w-40 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-300 py-3 px-4 sm:px-8 text-lg font-semibold flex items-center justify-center ${isIOS() ? 'touch-manipulation' : ''}`}
            style={isIOS() ? { 
              WebkitTapHighlightColor: 'transparent',
              WebkitAppearance: 'none',
              WebkitTransform: 'translateZ(0)',
              transform: 'translateZ(0)'
            } : undefined}
          >
            Learn More
          </Link>
        </div>
      </div>
    </Layout>
  );
}
