'use client';

import { useState } from 'react';
import { Copy, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { apiFetch, errorMessage } from '@/lib/api';
import { useWines } from '../../WineProvider';
import { SectionCard } from './SectionCard';
import type { Wine } from '../../types';

export function AiSummarySection({ wine }: { wine: Wine }) {
  const { patchWine } = useWines();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = wine.ai_summary ?? '';

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const data = await apiFetch<{ summary: string }>('/api/getaisummary', {
        method: 'POST',
        body: JSON.stringify({
          wine_id: wine.id,
          wine_name: wine.name,
          wine_producer: wine.producer,
        }),
      });
      patchWine(wine.id, { ai_summary: data.summary });
    } catch (err) {
      setError(errorMessage(err, 'Could not generate a summary.'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SectionCard
      title="AI summary"
      action={
        summary && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(summary);
              toast.success('Copied to clipboard');
            }}
          >
            <Copy />
            Copy
          </Button>
        )
      }
    >
      <div className="text-sm" aria-live="polite">
        {isGenerating ? (
          <div className="text-muted-foreground flex items-center gap-2 py-6">
            <Loader2 className="size-4 animate-spin" />
            Generating a summary…
          </div>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : summary ? (
          <p className="whitespace-pre-wrap">{summary}</p>
        ) : (
          <p className="text-muted-foreground">
            No summary yet. Generate one to get background on this wine.
          </p>
        )}
      </div>

      <Button
        variant="outline"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="mt-3 w-full"
      >
        <Sparkles className="text-accent" />
        {summary ? 'Regenerate summary' : 'Get AI summary'}
      </Button>
    </SectionCard>
  );
}
