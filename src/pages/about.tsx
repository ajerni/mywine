import "@/app/globals.css"

import { Bitcoin, Coins, Github, Linkedin, Twitter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function AboutUs() {
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Address copied to clipboard")
    } catch (err) {
      toast.error("Failed to copy address")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-red-500">About Wine Cellar</h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
            Empowering wine enthusiasts to curate, manage, and enjoy their collections with cutting-edge technology.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-red-500">Our Story</h2>
            <p className="text-gray-300 mb-4">
              Wine Cellar was born from a passion for wine and a desire to simplify collection management. Our team of
              wine enthusiasts and tech experts came together to create a platform that combines the art of wine
              appreciation with the power of modern technology.
            </p>
            <p className="text-gray-300 mb-4">
              We understand the joy of discovering new wines, the pride in curating a personal collection, and the
              importance of preserving memories associated with each bottle. That's why we've developed features that
              not only help you manage your inventory but also enhance your overall wine experience.
            </p>
            <p className="text-gray-300">
              From AI-powered insights to detailed tasting notes, Wine Cellar is designed to be your digital sommelier,
              always at your fingertips.
            </p>
          </div>
         
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-green-500 text-center">Support Our Project</h2>
          <p className="text-gray-300 text-center mb-8">
            If you enjoy using Wine Cellar and want to support our ongoing development, consider making a
            cryptocurrency donation. Your contribution helps us improve the app and add new features.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <Bitcoin className="h-6 w-6 text-[#F7931A]" />
                  Donate Bitcoin
                </CardTitle>
                <CardDescription className="text-green-400">Support us with BTC</CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="btc-address" className="text-green-400">BTC Address</Label>
                <div className="flex mt-1.5">
                  <Input
                    id="btc-address"
                    value="bc1qr7a9pqga96j5l49q00vrdcx495khl4fh525986"
                    readOnly
                    className="bg-zinc-800 text-white border-zinc-700"
                  />
                  <Button 
                    variant="outline" 
                    className="ml-2 whitespace-nowrap hover:bg-green-500"
                    onClick={() => copyToClipboard("bc1qr7a9pqga96j5l49q00vrdcx495khl4fh525986")}
                  >
                    Copy Address
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <Coins className="h-6 w-6 text-[#627EEA]" />
                  Donate Ethereum
                </CardTitle>
                <CardDescription className="text-green-400">Support us with ETH</CardDescription>
              </CardHeader>
              <CardContent>
                <Label htmlFor="eth-address" className="text-green-400">ETH Address</Label>
                <div className="flex mt-1.5">
                  <Input
                    id="eth-address"
                    value="0xFFaA8aD4001161ACAA8769D1c5ae40735DbAe4C1"
                    readOnly
                    className="bg-zinc-800 text-white border-zinc-700"
                  />
                  <Button 
                    variant="outline" 
                    className="ml-2 whitespace-nowrap hover:bg-green-500"
                    onClick={() => copyToClipboard("0xFFaA8aD4001161ACAA8769D1c5ae40735DbAe4C1")}
                  >
                    Copy Address
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-red-500">Connect With Us</h2>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="icon" className="rounded-full">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}