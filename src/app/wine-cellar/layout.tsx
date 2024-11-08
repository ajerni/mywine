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
        
        // Force layout recalculation
        requestAnimationFrame(() => {
          document.documentElement.style.height = '100%';
          document.body.style.height = '100%';
          document.body.style.position = 'fixed';
          document.body.style.width = '100%';
          document.body.style.overscrollBehavior = 'none';
        });
      }
    };

    handleIOSViewport();
    window.addEventListener('resize', handleIOSViewport);
    window.addEventListener('orientationchange', handleIOSViewport);
    
    return () => {
      window.removeEventListener('resize', handleIOSViewport);
      window.removeEventListener('orientationchange', handleIOSViewport);
    };
  }, []);

  return (
    <Layout>
      <div className="wine-cellar-layout">
        {children}
      </div>
    </Layout>
  );
} 