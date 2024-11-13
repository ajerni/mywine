'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Download, Upload, Loader2 } from 'lucide-react';

export function ImportExportData() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required', {
          position: "bottom-center",
          autoClose: 3000
        });
        return;
      }

      const response = await fetch('/api/csv/export', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export data');
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
      
      toast.success('Wine collection exported successfully! Check your downloads folder.', {
        position: "bottom-center",
        autoClose: 3000
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to export wine collection', {
        position: "bottom-center",
        autoClose: 5000
      });
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
        toast.error('Authentication required', {
          position: "bottom-center",
          autoClose: 3000
        });
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

      toast.success('Wine collection imported successfully! Refreshing page...', {
        position: "bottom-center",
        autoClose: 3000
      });
      
      // Increase the delay to 3000ms (3 seconds) to match the toast duration
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error) {
      console.error('Import error:', error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Failed to import wine collection. Please check your CSV file format.',
        {
          position: "bottom-center",
          autoClose: 5000
        }
      );
    } finally {
      setIsImporting(false);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-2 sm:py-4 min-h-screen overflow-y-auto -mt-2">
      <ToastContainer 
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mb-12"
      />
      
      <h1 className="text-2xl font-bold mb-4 sm:mb-6 text-foreground">Import & Export Data</h1>
      
      <div className="grid gap-6 md:grid-cols-2 pb-16">
        <div className="p-6 border rounded-lg bg-card flex flex-col min-h-[300px] h-auto">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Export Data</h2>
            <p className="text-muted-foreground mb-2">
              Download your wine cellar data as a CSV file to you local computer.
            </p>
            <p className="text-muted-foreground mb-2">
              These are your backup files and also allow easy editing in Excel or any Text Editor. Just make sure to save the edited files with the .csv extension and keep the first row as column headers.
            </p>
            <p className="text-muted-foreground">
              This download includes all wine details, your personal notes and the AI summaries.
            </p>
          </div>
          <div className="mt-4">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              variant="default"
              className="w-full hover:bg-gray-500"
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isExporting ? 'Exporting...' : 'Export to CSV'}
            </Button>
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card flex flex-col min-h-[300px] h-auto">
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Import Data</h2>
            <p className="text-muted-foreground mb-2">
              Upload your wine data from a CSV file. The file must exactly match the export format. Do not make any changes to the 'wine_id' column.
            </p>
            <p className="text-muted-foreground mb-1">
              <span className="text-destructive font-medium">Attention:</span>
            </p>
            <p className="text-muted-foreground">
              This upload will delete all existing wine data and replace it with the new data from the CSV file you are uploading. Always make sure to have a backup of your data before importing.
            </p>
          </div>
          <div className="mt-4">
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isImporting}
              variant="default"
              className="w-full hover:bg-gray-500"
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
    </div>
  );
} 