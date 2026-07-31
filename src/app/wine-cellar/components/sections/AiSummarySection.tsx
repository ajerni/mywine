'use client';

import { useState } from 'react';
import { Copy, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { apiFetch, errorMessage } from '@/lib/api';
import { DeleteConfirmationModal } from '../../DeleteConfirmationModal';
import { useWines } from '../../WineProvider';
import { SectionCard } from './SectionCard';
import type { Wine } from '../../types';

export function AiSummarySection({ wine }: { wine: Wine }) {
  const { patchWine } = useWines();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDelete = async () => {
    try {
      await apiFetch(`/api/getaisummary?wineId=${wine.id}`, { method: 'DELETE' });
      patchWine(wine.id, { ai_summary: undefined });
      toast.success('AI summary deleted');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete the summary.'));
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <SectionCard
      title="AI summary"
      action={
        summary ? (
          <div className="flex items-center gap-1">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Delete AI summary"
            >
              <Trash2 className="text-destructive" />
              Delete
            </Button>
          </div>
        ) : null
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

      {showDeleteConfirm ? (
        <DeleteConfirmationModal
          title="Delete AI summary"
          message="This summary will be removed. You can generate a new one later."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      ) : null}
    </SectionCard>
  );
}
