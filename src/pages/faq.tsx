import "@/app/globals.css"
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import Layout from "@/components/layout/Layout"

import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQ() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-red-500 text-center">Frequently Asked Questions</h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto text-center mb-12">
          Find answers to common questions about your digital sommelier.
        </p>

        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          <AccordionItem value="item-1" className="border-b border-zinc-800">
            <AccordionTrigger className="text-left">
              What is Wine Cellar and how does it work?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              Wine Cellar is a digital platform designed for wine enthusiasts to manage their wine collections. It allows you to track your inventory, add tasting notes, upload photos, and get AI-powered insights about your wines. Simply create an account, add your wines, and start exploring the features.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-b border-zinc-800">
            <AccordionTrigger className="text-left">
              How do I add a new wine to my collection?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              To add a new wine, navigate to your dashboard and click the "Add Wine" button. You can then enter details such as the wine name, vintage, producer, quantity, and any notes. You can also upload a photo of the bottle or label.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-b border-zinc-800">
            <AccordionTrigger className="text-left">
              Can I track the value of my wine collection?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              Yes, Wine Cellar includes features for tracking the value of your collection over time. Our AI-powered insights can provide estimates based on market data and your collection's specifics. Please note that these are estimates and should not be considered as financial advice.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border-b border-zinc-800">
            <AccordionTrigger className="text-left">
              How does the AI-powered summary feature work?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              Our AI analyzes the information you provide about each wine, including your tasting notes, and generates comprehensive summaries. These summaries can include flavor profiles, suggested food pairings, and optimal drinking windows. The more information you provide, the more detailed and accurate the AI summaries will be.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border-b border-zinc-800">
            <AccordionTrigger className="text-left">
              Is my data secure and private?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              We take data security and privacy very seriously. All your data is encrypted and stored securely. We do not share your personal information or details about your wine collection with third parties. You have full control over your data and can export or delete it at any time.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border-b border-zinc-800">
            <AccordionTrigger className="text-left">
              Can I share my wine collection or tasting notes with friends?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              Yes, Wine Cellar includes social features that allow you to share specific wines, tasting notes, or even your entire collection with friends or the Wine Cellar community. You have full control over what you share and with whom.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7" className="border-b border-zinc-800">
            <AccordionTrigger className="text-left">
              Can I export my data?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              Yes, you can export your collection data in various formats including CSV and PDF.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Didn't find the answer you were looking for?</p>
          <Button asChild className="bg-red-500 hover:bg-red-600 text-white">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </Layout>
  )
}
