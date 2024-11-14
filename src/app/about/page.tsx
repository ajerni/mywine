import { Metadata } from "next"
import "@/app/globals.css"
import Layout from "@/components/layout/Layout"
import { DonationCards } from "./components/DonationCard"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About Wine Cellar | Your Digital Sommelier",
  description: "Learn about Wine Cellar - your digital sommelier for curating, managing, and enjoying your wine collection.",
}

export default function AboutPage() {
  return (
    <Layout>
      <section className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-4 space-y-16">
          <header className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-red-500">
              About Wine Cellar
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Empowering wine enthusiasts to curate, manage, and enjoy their collections with cutting-edge technology.
            </p>
            <div className="text-center pt-4">
              <Link href="/learn-more" className="text-white hover:text-gray-300">
                Learn more...
              </Link>
            </div>
          </header>

          <section className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-green-500 text-center">
              Support Our Project
            </h2>
            <p className="text-gray-300 mb-8 text-center">
              If you enjoy using Wine Cellar and want to support our ongoing development, consider making a
              cryptocurrency donation. Your contribution helps us improve the app and add new features.
            </p>
            <DonationCards />
          </section>

          <section className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-red-500 text-center">
              Our Story
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Wine Cellar was born from a passion for wine and a desire to simplify collection management. Our team of
                wine enthusiasts and tech experts came together to create a platform that combines the art of wine
                appreciation with the power of modern technology.
              </p>
              <p>
                We understand the joy of discovering new wines, the pride in curating a personal collection, and the
                importance of preserving memories associated with each bottle. That's why we've developed features that
                not only help you manage your inventory but also enhance your overall wine experience.
              </p>
              <p>
                From AI-powered insights to detailed tasting notes, Wine Cellar is designed to be your digital sommelier,
                always at your fingertips.
              </p>
            </div>
          </section>
        </div>
      </section>
    </Layout>
  )
}