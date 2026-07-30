'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch, errorMessage } from '@/lib/api';
import { useWines } from '../../WineProvider';
import { SectionCard } from './SectionCard';
import type { Wine } from '../../types';

export function NotesSection({ wine }: { wine: Wine }) {
  const { patchWine } = useWines();
  const [notes, setNotes] = useState(wine.note_text ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(wine.note_text ?? '');
  }, [wine.id, wine.note_text]);

  const isDirty = notes !== (wine.note_text ?? '');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiFetch('/api/notes', {
        method: 'POST',
        body: JSON.stringify({ note_text: notes, wine_id: wine.id }),
      });
      patchWine(wine.id, { note_text: notes });
      toast.success('Notes saved');
    } catch (error) {
      toast.error(errorMessage(error, 'Could not save your notes.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SectionCard title="Your tasting notes">
      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Colour, nose, palate, finish — whatever you want to remember."
        className="min-h-32 resize-y"
        aria-label="Tasting notes"
      />
      <Button
        onClick={handleSave}
        disabled={isSaving || !isDirty}
        className="mt-3 w-full"
      >
        <Save />
        {isSaving ? 'Saving…' : isDirty ? 'Save notes' : 'Saved'}
      </Button>
    </SectionCard>
  );
}
