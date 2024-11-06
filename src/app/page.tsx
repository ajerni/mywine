"use client";

import Image from "next/image";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Layout>
      <div className="relative">
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
          {/* Wine Cellar Logo */}
          <div className="mb-12">
            <Image
              src="/mywinelogo.png"
              alt="Wine Cellar Logo"
              width={200}
              height={200}
              priority
            />
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold mb-6 text-red-500">
            Welcome to Your Wine Cellar
          </h1>
          <p className="text-lg sm:text-xl mb-12 max-w-2xl text-red-500">
            Track and manage your wine collection effortlessly
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-[80%] sm:w-auto">
            <Link 
              href="/login" 
              className="bg-green-500 hover:bg-green-600 text-white hover:text-black py-3 rounded-full text-base font-semibold mx-auto w-full sm:w-[200px] max-w-[280px]"
            >
              Login
            </Link>
            <Link 
              href="/learn-more" 
              className="border border-red-500 hover:bg-red-500 text-white hover:text-black py-3 rounded-full text-base font-semibold mx-auto w-full sm:w-[200px] max-w-[280px]"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
