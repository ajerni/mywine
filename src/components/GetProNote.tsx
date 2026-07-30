'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GetProNoteProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRO_FEATURES = [
  'AI-powered wine recommendations',
  'Advanced collection analytics',
  'Premium support',
  'And much more…',
];

export function GetProNote({ isOpen, onClose }: GetProNoteProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-accent size-5" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            Get access to our latest AI-powered features and take your wine
            experience to the next level.
          </DialogDescription>
        </DialogHeader>

        <ul className="text-muted-foreground space-y-2 text-sm">
          {PRO_FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="bg-accent mt-1.5 size-1.5 shrink-0 rounded-full" />
              {feature}
            </li>
          ))}
        </ul>

        <DialogFooter className="sm:flex-col sm:space-x-0 sm:gap-2">
          <Button asChild className="w-full">
            <Link href="/contact">Contact us to upgrade</Link>
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              Maybe later
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
