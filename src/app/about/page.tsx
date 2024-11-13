import "@/app/globals.css"
import Layout from "@/components/layout/Layout"
import { DonationCards } from "./components/DonationCard"

export default function AboutUs() {
  return (
    <Layout>
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-2">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-red-500">About Wine Cellar</h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Empowering wine enthusiasts to curate, manage, and enjoy their collections with cutting-edge technology.
            </p>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-green-500 text-center">Support Our Project</h2>
            <p className="text-gray-300 mb-8">
              If you enjoy using Wine Cellar and want to support our ongoing development, consider making a
              cryptocurrency donation. Your contribution helps us improve the app and add new features.
            </p>
            <DonationCards />
          </div>

          <div className="mb-16 flex items-center justify-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold mb-6 text-red-500 text-center">Our Story</h2>
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
        </div>
      </div>
    </Layout>
  )
}