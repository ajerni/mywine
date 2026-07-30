'use client';

import { useRef, useState } from 'react';
import { AlertTriangle, Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { apiFetch, apiRequest, errorMessage } from '@/lib/api';
import { useWines } from '../WineProvider';

export function ImportExportData() {
  const { reload } = useWines();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await apiRequest('/api/csv/export');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = `wine-cellar-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch (error) {
      toast.error(errorMessage(error, 'Could not export your collection.'));
    } finally {
      setIsExporting(false);
    }
  };

  const chooseFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('That is not a .csv file');
      return;
    }
    setPendingFile(file);
  };

  const runImport = async () => {
    if (!pendingFile) return;
    const file = pendingFile;
    setPendingFile(null);
    setIsImporting(true);

    const body = new FormData();
    body.append('file', file);

    try {
      await apiFetch('/api/csv/import', { method: 'POST', body });
      await reload();
      toast.success(`Imported ${file.name}`);
    } catch (error) {
      toast.error(errorMessage(error, 'Could not import that file.'));
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold">Import &amp; export</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          CSV is the backup format for your cellar — wines, notes, ratings and AI summaries.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <Download className="text-accent size-5" aria-hidden />
              Export
            </CardTitle>
            <CardDescription>Download everything as a spreadsheet</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground flex flex-1 flex-col gap-3 text-sm">
            <p>
              The file contains every wine along with your notes, ratings and AI summaries.
              Open it in Excel or any text editor, edit it, and import it back.
            </p>
            <p>
              Exporting an empty cellar is also the easiest way to get a correctly formatted
              template.
            </p>
            <Button className="mt-auto w-full" onClick={handleExport} disabled={isExporting}>
              {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
              {isExporting ? 'Preparing…' : 'Export to CSV'}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-lg">
              <Upload className="text-accent size-5" aria-hidden />
              Import
            </CardTitle>
            <CardDescription>Replace your cellar from a CSV file</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3">
            <p className="text-muted-foreground text-sm">
              The file must match the export format exactly, including the{' '}
              <code className="bg-muted rounded px-1 py-0.5 text-xs">wine_id</code> column.
            </p>

            <p className="text-destructive flex items-start gap-2 text-sm font-medium">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              Importing deletes your entire collection and replaces it with the file. Export a
              backup first.
            </p>

            <label
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                chooseFile(event.dataTransfer.files[0]);
              }}
              className={cn(
                'mt-auto flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors',
                'focus-within:ring-ring focus-within:ring-2 focus-within:ring-offset-2',
                isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50',
                isImporting && 'pointer-events-none opacity-60',
              )}
            >
              {isImporting ? (
                <Loader2 className="text-muted-foreground size-6 animate-spin" aria-hidden />
              ) : (
                <FileSpreadsheet className="text-muted-foreground size-6" aria-hidden />
              )}
              <span className="text-sm font-medium">
                {isImporting ? 'Importing your collection…' : 'Drop a CSV here or browse'}
              </span>
              <span className="text-muted-foreground text-xs">.csv files only</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                disabled={isImporting}
                onChange={(event) => chooseFile(event.target.files?.[0])}
              />
            </label>
          </CardContent>
        </Card>
      </div>

      <Dialog open={pendingFile !== null} onOpenChange={(open) => !open && setPendingFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Replace your whole collection?</DialogTitle>
            <DialogDescription>
              Every wine currently in your cellar will be deleted and replaced with the contents
              of <span className="text-foreground font-medium">{pendingFile?.name}</span>. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingFile(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={runImport}>
              Replace collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
