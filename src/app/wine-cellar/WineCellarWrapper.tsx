'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { Wine } from './types';
import { useRouter } from 'next/navigation';

const WineCellarContent = dynamic(() => import('./WineCellarContent'), {
  ssr: false,
  loading: () => <p>Loading...</p>
});

export default function WineCellarWrapper() {
  const [isMounted, setIsMounted] = useState(false);
  const [initialWines, setInitialWines] = useState<Wine[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchWines = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          router.push('/login');
          return;
        }

        const response = await fetch('/api/wines', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
            return;
          }
          console.error('Failed to fetch wines:', response.status, response.statusText);
          throw new Error(`Failed to fetch wines: ${response.statusText}`);
        }

        const wines = await response.json();
        setInitialWines(wines);
      } catch (error) {
        console.error('Error fetching wines:', error);
        if (error instanceof Error && error.message.includes('401')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
      }
    };

    if (isMounted) {
      fetchWines();
    }
    setIsMounted(true);
  }, [isMounted, router]);

  if (!isMounted) {
    return null;
  }

  return <WineCellarContent initialWines={initialWines} />;
}