"use client"

import { DisclaimerModal } from "@/components/modals/DisclaimerModal"
import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname()
  const hideText = pathname === "/login" || pathname === "/register"

  return (
    <footer className="w-full bg-black py-4 px-4">
      <div className="container mx-auto flex justify-between items-center text-red-500">
        {!hideText && (
          <>
            <div className="footer-text text-black">
              © {new Date().getFullYear()} MyWine.info
            </div>
            <div className="flex gap-4 text-black">
              <DisclaimerModal>
                <button className="hover:text-gray-200 transition-colors footer-text">
                  Legal Disclaimer
                </button>
              </DisclaimerModal>
            </div>
          </>
        )}
      </div>
    </footer>
  )
} 