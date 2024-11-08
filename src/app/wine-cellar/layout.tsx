"use client"

import { useEffect } from 'react'
import Layout from '@/components/layout/Layout'

export default function WineCellarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const lockOrientation = async () => {
      if (typeof window !== 'undefined' && 
          /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        try {
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
          }
        } catch (error) {
          console.log('Viewport setup failed:', error);
        }
      }
    }

    lockOrientation();
  }, []);

  return (
    <Layout>
      <div className="wine-cellar-layout">
        {children}
      </div>
    </Layout>
  );
} 