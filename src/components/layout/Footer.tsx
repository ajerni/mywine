"use client"

import { DisclaimerModal } from "@/components/modals/DisclaimerModal"

export function Footer() {
  return (
    <footer className="w-full bg-black py-4 px-4">
      <div className="container mx-auto flex justify-between items-center text-red-500">
        <div className="footer-text">
          © {new Date().getFullYear()} MyWine.info
        </div>
        <div className="flex gap-4">
          <DisclaimerModal>
            <button className="hover:text-gray-200 transition-colors footer-text">
              Legal Disclaimertest
            </button>
          </DisclaimerModal>
        </div>
      </div>
    </footer>
  )
} 