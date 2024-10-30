"use client";

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-black text-red-500 font-[family-name:var(--font-geist-sans)]">
      <header className="flex justify-center w-full pt-10">
        <Image
          src="/mywinelogo.png"
          alt="Wine Cellar logo"
          width={360}
          height={76}
          priority
          className="m-5"
        />
      </header>
      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold mb-6 text-center">Welcome to Your Wine Cellar</h1>
        <h2 className="text-2xl mb-12 text-center">Track and manage your wine collection effortlessly</h2>
        
        <div className="flex gap-6 flex-col sm:flex-row">
          <a
            className="rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-colors duration-300 py-3 px-8 text-lg font-semibold flex items-center justify-center"
            href="/wine-cellar"
            onClick={(e) => {
              setIsLoading(true);
            }}
          >
            {isLoading ? "Loading..." : "Login"}
          </a>
          <a
            className="rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-300 py-3 px-8 text-lg font-semibold flex items-center justify-center"
            href="/learn-more"
          >
            Learn More
          </a>
        </div>
      </main>
      <footer className="py-8">
        <div className="flex justify-center gap-8">
          <a
            className="text-red-400 hover:text-red-300 transition-colors duration-300"
            href="/about"
          >
            About Us
          </a>
          <a
            className="text-red-400 hover:text-red-300 transition-colors duration-300"
            href="/contact"
          >
            Contact
          </a>
          <a
            className="text-red-400 hover:text-red-300 transition-colors duration-300"
            href="/faq"
          >
            FAQ
          </a>
        </div>
      </footer>
    </div>
  );
}
