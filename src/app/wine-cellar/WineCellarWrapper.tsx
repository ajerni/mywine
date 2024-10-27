'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Wine } from './types';

const WineCellarContent = dynamic(() => import('./WineCellarContent'), {
  ssr: false,
  loading: () => <p>Loading...</p>
});

export default function WineCellarWrapper() {
  const [isMounted, setIsMounted] = useState(false);
  const [initialWines, setInitialWines] = useState<Wine[]>([]);

  useEffect(() => {
    const fetchWines = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }

        const response = await fetch('/api/wines', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch wines');
        }

        const wines = await response.json();
        setInitialWines(wines);
      } catch (error) {
        console.error('Error fetching wines:', error);
      }
    };

    fetchWines();
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <WineCellarContent initialWines={initialWines} />;
}