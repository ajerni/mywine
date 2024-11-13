'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'react-toastify';
import { Download, Upload, Loader2 } from 'lucide-react';

export function ImportExportData() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/csv/export', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wine-cellar-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/csv/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to import data');
      }

      toast.success('Data imported successfully');
      window.location.reload();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import data');
    } finally {
      setIsImporting(false);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Import & Export Data</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Export Data</h2>
          <p className="text-gray-600 mb-4">
            Download your wine cellar data as a CSV file. This includes all wine details, notes, and AI summaries.
          </p>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isExporting ? 'Exporting...' : 'Export to CSV'}
          </Button>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Import Data</h2>
          <p className="text-gray-600 mb-4">
            Import wine data from a CSV file. The file should match the export format.
          </p>
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isImporting}
            className="w-full"
          >
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isImporting ? 'Importing...' : 'Import from CSV'}
          </Button>
          <input
            type="file"
            id="file-upload"
            accept=".csv"
            className="hidden"
            onChange={handleImport}
          />
        </div>
      </div>
    </div>
  );
} 