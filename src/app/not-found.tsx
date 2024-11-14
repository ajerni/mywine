"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import Layout from "@/components/layout/Layout"

export default function NotFound() {
  return (
    <Layout>
      <div className="h-[calc(100vh-5rem)] flex items-center justify-center -mt-16 p-2 bg-black text-white">
        <div className="text-center space-y-8">
          {/* Logo */}
          <div>
            <Image
              src="/wine_logo_white_transparent.webp"
              alt="Wine Cellar Logo"
              width={150}
              height={150}
              priority
              className="mx-auto"
            />
          </div>

          {/* Error Message */}
          <h1 className="text-4xl sm:text-6xl font-bold text-red-500">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-green-500">
            Page Not Found
          </h2>
          
          {/* Description */}
          <p className="text-lg text-gray-400 max-w-md mx-auto">
            Looks like this bottle is missing from our cellar. Let's get you back to a page that exists.
          </p>

          {/* Action Button */}
          <div className="flex justify-center items-center">
            <Link href="/">
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white h-14 px-8 rounded-full text-lg font-semibold flex items-center gap-2"
                style={{
                  background: 'rgb(0, 200, 83)',
                }}
              >
                <Home className="h-5 w-5" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
} 