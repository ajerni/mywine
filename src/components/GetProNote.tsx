'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { X } from 'lucide-react';

interface GetProNoteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GetProNote({ isOpen, onClose }: GetProNoteProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg w-[90vw] max-w-[425px] focus:outline-none">
          <div className="relative pr-6">
            <Dialog.Title className="text-lg font-semibold mb-4 text-blue-400">
              Upgrade to Pro Account
            </Dialog.Title>
            
            <Dialog.Close asChild>
              <button
                className="absolute -right-2 -top-1 p-2 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </Dialog.Close>

            <div className="space-y-4 text-sm text-gray-600">
              <p>
                Get access to our latest AI-powered features and take your wine experience to the next level!
              </p>
              <p>
                Pro features include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>AI-powered wine recommendations</li>
                <li>Advanced collection analytics</li>
                <li>Premium support</li>
                <li>And much more...</li>
              </ul>
            </div>

            <div className="flex flex-col gap-4 mt-6">
              <Link href="/contact" className="w-full">
                <Button className="w-full bg-blue-400 text-white hover:bg-blue-300 hover:text-black">Contact Us to Upgrade</Button>
              </Link>
              <Button variant="outline" onClick={onClose} className="w-full">
                Maybe Later
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
} 