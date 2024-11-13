import "@/app/globals.css"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Layout from "@/components/layout/Layout"

const faqItems = [
  {
    id: 'item-1',
    question: 'What is Wine Cellar from MyWine.info and how does it work?',
    answer: 'Wine Cellar from MyWine.info is a digital platform designed for wine enthusiasts to manage their wine collections. It allows you to track your inventory, add tasting notes, upload photos, and get AI-powered insights about your wines. Simply create an account, add your wines, and start exploring the features.'
  },
  {
    id: 'item-2',
    question: 'How do I add a new wine to my collection?',
    answer: 'To add a new wine, navigate to your Wine Cellar and click the "Add Wine" button. You can then enter details such as the wine name, producer, country, region, vintage and quantity. Clicking on your wine entry in the table opens the detail page which allows you to add tasting notes, upload photos, and get AI-powered insights about your wines.'
  },
  {
    id: 'item-3',
    question: 'Is Wine Cellar free to use?',
    answer: 'Yes, Wine Cellar is currently free to use. We offer all features without any subscription fees. However, we appreciate donations to help maintain and improve the service.'
  },
  {
    id: 'item-4',
    question: 'How does the AI-powered summary feature work?',
    answer: 'Our AI analyzes the information you provide about each wine, including the name and producer to generate comprehensive summaries. The AI helps you understand the characteristics, history, and unique aspects of your wines.'
  },
  {
    id: 'item-5',
    question: 'Is my data secure and private?',
    answer: 'We take data security and privacy very seriously. All your data is encrypted and stored securely. We do not share your personal information like email address with third parties. You have full control over your data and can export or delete it at any time. However, please note that we do not currently offer a backup service and cannot restore your data if you lose your account. Please also read our Legal Disclaimer.'
  },
  {
    id: 'item-6',
    question: 'Can I share my wine collection or tasting notes with friends?',
    answer: 'You can copy your notes and AI-summaries to the clipboard by pressing the copy button. Social features that allow you to share and rate specific wines, tasting notes or even your entire collection with friends or the Wine Cellar community are planned for the future.'
  },
  {
    id: 'item-7',
    question: 'Can I export and import my data?',
    answer: 'Yes, you can export and import your wine collection data as csv file to keep your data safe and secure as well as use it to easily edit data offline.'
  }
]

export default function FAQPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-2 md:py-2">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-red-500 text-center">
          Frequently Asked Questions
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 text-center">
          Find answers to common questions about your digital sommelier.
        </p>

        <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto px-4 md:px-0">
          {faqItems.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-b border-zinc-800">
              <AccordionTrigger className="text-left text-red-500">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-400 px-1">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center max-w-3xl mx-auto">
          <p className="text-gray-400 mb-4">Didn't find the answer you were looking for?</p>
          <Button asChild className="bg-red-500 hover:bg-red-600 text-white">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </Layout>
  )
}