import Layout from '@/components/layout/Layout';
import { WineProvider } from './WineProvider';

export default function WineCellarLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      <WineProvider>{children}</WineProvider>
    </Layout>
  );
}
