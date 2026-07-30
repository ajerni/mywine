"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DisclaimerModalProps {
  children: React.ReactNode;
}

export function DisclaimerModal({ children }: DisclaimerModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Legal disclaimer</DialogTitle>
        </DialogHeader>
        <div className="text-muted-foreground max-h-[60vh] space-y-3 overflow-y-auto pr-2 text-sm">
          <p>
            The information provided by MyWine.info (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
            &ldquo;our&rdquo;) on www.mywine.info and mywine.info (the &ldquo;Site&rdquo;) is
            for general informational purposes only.
          </p>
          <p>
            All information on the Site is provided in good faith, however we make no
            representation or warranty of any kind, express or implied, regarding the
            accuracy, adequacy, validity, reliability, availability, or completeness of
            any information on the Site.
          </p>
          <p className="uppercase">
            Under no circumstance shall we have any liability to you for any loss or
            damage of any kind incurred as a result of the use of the Site or reliance
            on any information provided on the Site. Your use of the Site and your
            reliance on any information on the Site is solely at your own risk.
          </p>
          <p>
            We are not responsible or liable for any loss or corruption of data, including
            but not limited to wine collection information, user preferences, pictures or
            any other data stored or managed through the Site. Users are strongly advised
            to maintain their own backups of any important information. Data storage relies
            on third party providers, and we cannot guarantee the security or integrity of
            the data.
          </p>
          <p>
            The Site may contain (or you may be sent through the Site) links to other
            websites or content belonging to or originating from third parties. Such
            external links are not investigated, monitored, or checked for accuracy,
            adequacy, validity, reliability, availability, or completeness by us.
          </p>
          <p className="text-foreground font-medium">
            © {new Date().getFullYear()} www.mywine.info — All rights reserved.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
