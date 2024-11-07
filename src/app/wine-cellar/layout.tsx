"use client"

import { useEffect } from 'react'
import Layout from '@/components/layout/Layout'

export default function WineCellarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const handleIOSViewport = () => {
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        // Set viewport height
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Prevent unwanted scrolling/bouncing
        document.body.style.setProperty('overflow', 'hidden');
        document.body.style.setProperty('position', 'fixed');
        document.body.style.setProperty('width', '100%');
        document.body.style.setProperty('height', '100%');
        
        // Update meta viewport
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
          );
        }
      }
    };

    handleIOSViewport();
    window.addEventListener('resize', handleIOSViewport);
    return () => window.removeEventListener('resize', handleIOSViewport);
  }, []);

  return (
    <Layout>
      <div className="wine-cellar-layout">
        {children}
      </div>
    </Layout>
  );
} 