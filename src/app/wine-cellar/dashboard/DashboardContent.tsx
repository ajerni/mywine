'use client';

import { useState, useEffect } from 'react';
import { Wine } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wine as WineIcon, GlobeIcon, Grape, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface WineStats {
  totalBottles: number;
  totalValue: number;
  uniqueWines: number;
  uniqueCountries: number;
  uniqueGrapes: number;
  countriesData: { [key: string]: { count: number; value: number } };
  grapesData: { [key: string]: { count: number; value: number } };
  yearData: { [key: string]: { count: number; value: number } };
}

export default function DashboardContent() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchWines = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/wines', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch wines');
        }

        const fetchedWines = await response.json();
        setWines(fetchedWines);
      } catch (error) {
        console.error('Error fetching wines:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWines();
  }, [router]);

  const calculateStats = (): WineStats => {
    const stats: WineStats = {
      totalBottles: 0,
      totalValue: 0,
      uniqueWines: wines.length,
      uniqueCountries: 0,
      uniqueGrapes: 0,
      countriesData: {},
      grapesData: {},
      yearData: {},
    };

    wines.forEach((wine) => {
      const quantity = wine.quantity || 0;
      const price = wine.price || 0;
      const totalValue = quantity * price;

      // Update total counts
      stats.totalBottles += quantity;
      stats.totalValue += totalValue;

      // Update country stats
      if (wine.country) {
        if (!stats.countriesData[wine.country]) {
          stats.countriesData[wine.country] = { count: 0, value: 0 };
        }
        stats.countriesData[wine.country].count += quantity;
        stats.countriesData[wine.country].value += totalValue;
      }

      // Update grape stats
      if (wine.grapes) {
        const grapes = wine.grapes.split(',').map(g => g.trim());
        grapes.forEach(grape => {
          if (!stats.grapesData[grape]) {
            stats.grapesData[grape] = { count: 0, value: 0 };
          }
          stats.grapesData[grape].count += quantity;
          stats.grapesData[grape].value += totalValue;
        });
      }

      // Update year stats
      if (wine.year) {
        const year = wine.year.toString();
        if (!stats.yearData[year]) {
          stats.yearData[year] = { count: 0, value: 0 };
        }
        stats.yearData[year].count += quantity;
        stats.yearData[year].value += totalValue;
      }
    });

    stats.uniqueCountries = Object.keys(stats.countriesData).length;
    stats.uniqueGrapes = Object.keys(stats.grapesData).length;

    return stats;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="container mx-auto px-4 py-2">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 text-red-500 text-center pb-8">Cellar Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bottles</CardTitle>
            <WineIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBottles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique Wines</CardTitle>
            <WineIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueWines}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <GlobeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueCountries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Grape Varieties</CardTitle>
            <Grape className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueGrapes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Countries Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Wines by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.countriesData)
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([country, data]) => (
                  <div key={country} className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{country}</div>
                      <div className="text-xs text-muted-foreground">
                        {data.count} bottles - ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${(data.count / stats.totalBottles) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Grapes Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Wines by Grape Variety</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.grapesData)
                .sort(([, a], [, b]) => b.count - a.count)
                .slice(0, 10) // Show top 10 grapes
                .map(([grape, data]) => (
                  <div key={grape} className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{grape}</div>
                      <div className="text-xs text-muted-foreground">
                        {data.count} bottles - ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${(data.count / stats.totalBottles) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Vintage Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Wines by Vintage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.yearData)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([year, data]) => (
                  <div key={year} className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{year}</div>
                      <div className="text-xs text-muted-foreground">
                        {data.count} bottles - ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${(data.count / stats.totalBottles) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 