'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const WineCellarContent = dynamic(() => import('./WineCellarContent'), {
  ssr: false,
  loading: () => <p>Loading...</p>
});

export default function WineCellarWrapper() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <WineCellarContent />;
}
