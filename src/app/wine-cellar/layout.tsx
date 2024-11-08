"use client"

import { useEffect } from 'react'
import Layout from '@/components/layout/Layout'

export default function WineCellarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Layout>
      <div className="wine-cellar-layout">
        {children}
      </div>
    </Layout>
  );
} 