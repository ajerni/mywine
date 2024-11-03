"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToasterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Toaster({ className, ...props }: ToasterProps) {
  return (
    <div
      className={cn(
        "fixed top-4 z-50 flex items-center justify-center w-full",
        className
      )}
      {...props}
    >
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm mx-auto">
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-sm">Message Sent</h3>
          <p className="text-sm text-gray-500">
            We've received your message and will get back to you soon.
          </p>
        </div>
      </div>
    </div>
  )
} 