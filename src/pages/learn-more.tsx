import "@/app/globals.css"

import Image from "next/image"
import Link from "next/link"
import { Camera, ClipboardList, Cpu, MessageSquareText, Wine } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Layout from "@/components/layout/Layout"

export default function LearnMore() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-500 to-red-700 text-transparent bg-clip-text">
            Discover Your Wine Cellar
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
            Your personal sommelier in digital form. Manage your collection with powerful features designed for wine
            enthusiasts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-red-500" />
                Inventory Management
              </CardTitle>
              <CardDescription className="text-gray-400">
                Keep track of your wine collection with ease
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li>• Track stock quantities</li>
                <li>• Organize by variety, region, or vintage</li>
                <li>• Flexible search and filtering options</li>
                <li>• Export and import data as a CSV file</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareText className="h-6 w-6 text-red-500" />
                Tasting Notes (with AI search)
              </CardTitle>
              <CardDescription className="text-gray-400">
                Document your wine journey with detailed notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li>• Add personal tasting notes</li>
                <li>• Rate your wines</li>
                <li>• Record food pairings</li>
                <li>• Share notes with friends</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-6 w-6 text-red-500" />
                Photo Gallery
              </CardTitle>
              <CardDescription className="text-gray-400">
                Build a visual library of your collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-300">
                <li>• Capture bottle photos</li>
                <li>• Store label images</li>
                <li>• Document cork conditions</li>
                <li>• Create visual memories</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 text-white md:col-span-2 lg:col-span-3 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-6 w-6 text-red-500" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription className="text-gray-400">
              Let artificial intelligence enhance your wine experience
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Smart Summaries & Recommendations</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• AI-generated wine descriptions</li>
                <li>• Smart cellar insights on your collection</li>
                <li>• Food pairing recommendations</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Collection Analytics</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Talk to your AI sommelier</li>
                <li>• Ask questions about your wine collection</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mb-16">
          <Button 
            asChild 
            size="lg" 
            className="bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 px-8 py-8 text-lg font-semibold rounded-xl shadow-lg hover:shadow-red-500/20 hover:text-black"
          >
            <Link href="/login">Start Your Collection</Link>
          </Button>
        </div>
      </div>
    </Layout>
  )
}