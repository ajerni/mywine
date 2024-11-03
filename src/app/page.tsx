"use client";

import Image from "next/image";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-5rem)]">
        <Image
          src="/mywinelogo.png"
          alt="Wine Cellar logo"
          width={250}
          height={60}
          priority
          className="mb-12"
        />
        <h1 className="text-5xl font-bold mb-6 text-center">Welcome to Your Wine Cellar</h1>
        <h2 className="text-2xl mb-12 text-center">Track and manage your wine collection effortlessly</h2>
        
        <div className="flex gap-6 flex-col sm:flex-row">
          <button
            className="rounded-full border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-black transition-colors duration-300 py-3 px-8 text-lg font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-green-500"
            onClick={() => {
              setIsLoading(true);
              window.location.href = '/wine-cellar';
            }}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Login"}
          </button>
          <Link
            href="/learn-more"
            className="rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-300 py-3 px-8 text-lg font-semibold flex items-center justify-center"
          >
            Learn More
          </Link>
        </div>
      </div>
    </Layout>
  );
}
