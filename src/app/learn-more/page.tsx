import "@/app/globals.css"
import Link from "next/link"
import { Camera, ClipboardList, Cpu, MessageSquareText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Layout from "@/components/layout/Layout"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  bulletPoints: string[]
}

function FeatureCard({ icon, title, description, bulletPoints }: FeatureCardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 text-white hover:border-red-500/50 transition-colors duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-gray-300">
          {bulletPoints.map((point, index) => (
            <li key={index}>• {point}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default function LearnMore() {
  const features = [
    {
      icon: <ClipboardList className="h-6 w-6 text-red-500" />,
      title: "Inventory Management",
      description: "Keep track of your wine collection with ease",
      bulletPoints: [
        "Track stock quantities",
        "Organize by variety, region, or vintage",
        "Flexible search and filtering options",
        "Export and import data as a CSV file"
      ]
    },
    {
      icon: <MessageSquareText className="h-6 w-6 text-red-500" />,
      title: "Tasting Notes (AI search)",
      description: "Document your wine journey with detailed notes",
      bulletPoints: [
        "Add personal tasting notes",
        "Rate your wines",
        "Record food pairings",
        "Search your notes with AI"
      ]
    },
    {
      icon: <Camera className="h-6 w-6 text-red-500" />,
      title: "Photo Gallery",
      description: "Build a visual library of your collection",
      bulletPoints: [
        "Capture bottle photos",
        "Store label images",
        "Document cork conditions",
        "Create visual memories"
      ]
    }
  ]

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4">
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
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
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
                <li>• Analytics Dashboard</li>
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
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-8 text-lg font-semibold rounded-xl shadow-lg hover:shadow-green-500/20"
          >
            <Link href="/login">Start Your Collection</Link>
          </Button>
        </div>
      </div>
    </Layout>
  )
}