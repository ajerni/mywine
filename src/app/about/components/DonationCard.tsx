'use client';

import { Bitcoin, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast, Toaster } from "sonner"

export function DonationCards() {
  async function copyToClipboard(text: string, type: 'BTC' | 'ETH') {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${type} address copied`)
    } catch (err) {
      toast.error("Failed to copy address")
    }
  }

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            zIndex: 100000,
            marginTop: '100px',
          },
        }}
      />
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
            <div className="flex flex-col sm:flex-row mt-1.5 gap-2">
              <Input
                id="btc-address"
                value="bc1qr7a9pqga96j5l49q00vrdcx495khl4fh525986"
                readOnly
                className="bg-zinc-800 text-white border-zinc-700"
              />
              <Button 
                variant="outline" 
                className="shrink-0 bg-green-500 hover:bg-white hover:text-black"
                onClick={() => copyToClipboard("bc1qr7a9pqga96j5l49q00vrdcx495khl4fh525986", "BTC")}
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
            <div className="flex flex-col sm:flex-row mt-1.5 gap-2">
              <Input
                id="eth-address"
                value="0xFFaA8aD4001161ACAA8769D1c5ae40735DbAe4C1"
                readOnly
                className="bg-zinc-800 text-white border-zinc-700"
              />
              <Button 
                variant="outline" 
                className="shrink-0 bg-green-500 hover:bg-white hover:text-black"
                onClick={() => copyToClipboard("0xFFaA8aD4001161ACAA8769D1c5ae40735DbAe4C1", "ETH")}
              >
                Copy Address
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 