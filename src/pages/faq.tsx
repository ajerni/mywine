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
      <div className="container mx-auto px-4 py-18">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-red-500 text-center">Frequently Asked Questions</h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 text-left md:text-center">
          Find answers to common questions about your digital sommelier.
        </p>

        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
          <AccordionItem value="item-1" className="border-b border-zinc-800">
            <AccordionTrigger className="text-left text-red-500">
              What is Wine Cellar from MyWine.info and how does it work?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              Wine Cellar from MyWine.info is a digital platform designed for wine enthusiasts to manage their wine collections. It allows you to track your inventory, add tasting notes, upload photos, and get AI-powered insights about your wines. Simply create an account, add your wines, and start exploring the features.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-b border-zinc-800">
            <AccordionTrigger className="text-left text-red-500">
              How do I add a new wine to my collection?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              To add a new wine, navigate to your dashboard and click the "Add Wine" button. You can then enter details such as the wine name, producer, country, regioin, vintage and quantity. Clicking on your wine entry in the table opens the detail page which allows you to add tasting notes, upload photos, and get AI-powered insights about your wines.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border-b border-zinc-800">
            <AccordionTrigger className="text-left text-red-500">
              How does the AI-powered summary feature work?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              Our AI analyzes the information you provide about each wine, including the name and producer to generate comprehensive summaries.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border-b border-zinc-800">
            <AccordionTrigger className="text-left text-red-500">
              Is my data secure and private?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              We take data security and privacy very seriously. All your data is encrypted and stored securely. We do not share your personal information like email address with third parties. You have full control over your data and can export or delete it at any time. However, please note that we do not currently offer a backup service and cannot restore your data if you lose your account. Please also read our Legal Disclaimer.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border-b border-zinc-800">
            <AccordionTrigger className="text-left text-red-500">
              Can I share my wine collection or tasting notes with friends?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              You can copy your notes and AI-summaries to the clipboard by pressing the copy button. Social features that allow you to share and rate specific wines, tasting notes or even your entire collection with friends or the Wine Cellar community are planned for the future.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7" className="border-b border-zinc-800">
            <AccordionTrigger className="text-left text-red-500">
              Can I export my data?
            </AccordionTrigger>
            <AccordionContent className="text-gray-400">
              Yes, you can export your collection data as csv file.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-12 text-center md:text-center max-w-3xl mx-auto">
          <p className="text-gray-400 mb-4">Didn't find the answer you were looking for?</p>
          <Button asChild className="bg-red-500 hover:bg-red-600 text-white">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </Layout>
  )
}