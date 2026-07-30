'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Send, Sparkles, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { apiFetch, errorMessage } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatWindow({ isOpen, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const message = input.trim();
    if (!message || isLoading) return;

    // Capture prior turns before appending the new user message (closure has current state)
    const history = messages;

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');
    setIsLoading(true);

    try {
      const data = await apiFetch<{ status: string; message: string }>('/api/startchat', {
        method: 'POST',
        body: JSON.stringify({ message, history }),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage(error, 'Sorry, something went wrong. Please try again.'),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="grid max-h-[85dvh] grid-rows-[auto_1fr_auto] gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-6 py-4 pr-16 text-left">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <DialogTitle className="font-display flex items-center gap-2 text-xl">
                <Sparkles className="text-accent size-5" />
                AI Sommelier
              </DialogTitle>
              <DialogDescription>Ask anything about your collection.</DialogDescription>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMessages([])}
                aria-label="Clear conversation"
                className="mt-0.5 mr-8 shrink-0"
              >
                <Trash2 />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="min-h-64 space-y-3 overflow-y-auto px-6 py-4" aria-live="polite">
          {messages.length === 0 && !isLoading ? (
            <p className="text-muted-foreground py-10 text-center text-sm">
              Try “Which reds should I drink this year?”
            </p>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          className="flex items-center gap-2 border-t px-6 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about your collection…"
            disabled={isLoading}
            aria-label="Message"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} aria-label="Send">
            {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
