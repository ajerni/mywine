import type { Metadata } from 'next';

import WineCellarView from './WineCellarView';

export const metadata: Metadata = {
  title: 'Wine Cellar',
  description: 'Browse, search and manage the wines in your collection.',
};

export default function WineCellarPage() {
  return <WineCellarView />;
}
