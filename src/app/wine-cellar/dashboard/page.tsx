import type { Metadata } from 'next';

import DashboardContent from './DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Bottle counts, estimated value and breakdowns by country, grape and vintage.',
};

export default function DashboardPage() {
  return <DashboardContent />;
}
