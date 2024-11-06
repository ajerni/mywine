"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { X } from "lucide-react"
import { useState } from "react"

interface DisclaimerModalProps {
  children: React.ReactNode;
}

export function DisclaimerModal({ children }: DisclaimerModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[400px] bg-black border border-red-900 p-8 fixed left-[50%] top-[50%] w-[90vw] max-h-[85vh] overflow-y-auto"
        style={{
          transform: 'translate(-50%, -50%)',
          WebkitTransform: 'translate(-50%, -50%)',
          position: 'fixed',
          margin: '0 auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4 text-gray-400" />
          <span className="sr-only">Close</span>
        </button>
        <DialogHeader>
          <DialogTitle className="text-red-500">Legal Disclaimer</DialogTitle>
        </DialogHeader>
        <div className="text-gray-500 space-y-3 overflow-y-auto pr-2" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          <p>
            The information provided by MyWine.info ("we," "us," or "our") on www.mywine.info and mywine.info (the "Site") 
            is for general informational purposes only.
          </p>
          <p>
            All information on the Site is provided in good faith, however we make no 
            representation or warranty of any kind, express or implied, regarding the 
            accuracy, adequacy, validity, reliability, availability, or completeness of 
            any information on the Site.
          </p>
          <p>
            UNDER NO CIRCUMSTANCE SHALL WE HAVE ANY LIABILITY TO YOU FOR ANY LOSS OR 
            DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF THE SITE OR RELIANCE 
            ON ANY INFORMATION PROVIDED ON THE SITE. YOUR USE OF THE SITE AND YOUR 
            RELIANCE ON ANY INFORMATION ON THE SITE IS SOLELY AT YOUR OWN RISK.
          </p>
          <p>
            We are not responsible or liable for any loss or corruption of data, including 
            but not limited to wine collection information, user preferences, pictures or any other 
            data stored or managed through the Site. Users are strongly advised to maintain 
            their own backups of any important information. Data storage relies on third party providers,
            and we cannot guarantee the security or integrity of the data.
          </p>
          <p>
            The Site may contain (or you may be sent through the Site) links to other 
            websites or content belonging to or originating from third parties. Such 
            external links are not investigated, monitored, or checked for accuracy, 
            adequacy, validity, reliability, availability, or completeness by us.
          </p>
          <p className="font-bold text-red-500">
            © {new Date().getFullYear()} www.mywine.info - All rights reserved.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 