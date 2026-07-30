import type { Metadata } from 'next';

import { ImportExportData } from './ImportExportData';

export const metadata: Metadata = {
  title: 'Import & export',
  description: 'Back up your cellar as CSV or restore it from a file.',
};

export default function DataPage() {
  return <ImportExportData />;
}
