"use client";

import Image from "next/image";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Link from "next/link";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-5rem)] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-start py-8 px-4">
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
              className="bg-green-500 hover:bg-green-600 text-white hover:text-black py-3 rounded-full text-base font-semibold mx-auto w-full sm:w-[200px] max-w-[280px] flex items-center justify-center"
              style={{
                background: 'rgb(0, 200, 83)',
                borderRadius: '9999px'
              }}
            >
              Login
            </Link>
            <Link 
              href="/learn-more" 
              className="border border-red-500 hover:bg-red-500 text-white hover:text-black py-3 rounded-full text-base font-semibold mx-auto w-full sm:w-[200px] max-w-[280px] flex items-center justify-center"
              style={{
                borderColor: 'rgb(255, 0, 60)',
                borderWidth: '1px',
                borderRadius: '9999px'
              }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
