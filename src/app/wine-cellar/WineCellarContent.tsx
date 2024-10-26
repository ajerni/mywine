'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { handleDelete, handleSave, handleAdd } from './wineHandlers';
import { Wine, NumericFilter, User } from './types';
import { useRouter } from 'next/navigation';
import { logoutUser, getCurrentUser } from '../auth/authHandlers';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WineDetailsModal } from './WineDetailsModal';

const logError = (message: string, ...args: any[]) => {
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message, ...args);
  }
};

const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};

export default function WineCellarContent({ initialWines }: { initialWines: Wine[] }) {
  const [wines, setWines] = useState<Wine[]>(initialWines);
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newWine, setNewWine] = useState<Omit<Wine, 'id'>>({
    name: '', producer: '', grapes: '', country: '', region: '', year: null, price: null, quantity: 0, user_id: null, note_text: ''
  });
  const [filters, setFilters] = useState<{[K in keyof Wine]?: string | NumericFilter}>({});
  const [user, setUser] = useState<User | null>(null);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const router = useRouter();
  const [showScrollButton, setShowScrollButton] = useState(false);

  const fetchWines = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('/api/wines', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wines');
      }

      const fetchedWines = await response.json();
      console.log('Fetched wines:', fetchedWines);
      setWines(fetchedWines);
    } catch (error) {
      console.error('Error fetching wines:', error);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          await fetchWines(); // Fetch wines when user is logged in
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, [router]);

  const handleEdit = (wine: Wine) => {
    setEditingWine(wine);
    setIsAdding(false);
  };

  const handleDeleteAndRefresh = async (id: number) => {
    const success = await handleDelete(id);
    if (success) {
      await fetchWines(); // Refresh the wine list after deleting
    }
  };

  const handleSaveAndRefresh = async (updatedWine: Wine) => {
    const success = await handleSave(updatedWine);
    if (success) {
      await fetchWines(); // Refresh the wine list after updating
      setEditingWine(null);
    }
  };

  const handleAddAndRefresh = async (newWineData: Omit<Wine, 'id'>) => {
    const success = await handleAdd(newWineData);
    if (success) {
      await fetchWines(); // Refresh the wine list after adding
      setIsAdding(false);
    }
  };

  const WineForm = ({ wine, onSave, isNew = false }: { wine: Wine | Omit<Wine, 'id'>, onSave: (wine: Wine | Omit<Wine, 'id'>) => void, isNew?: boolean }) => {
    const [form, setForm] = useState(wine);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(form);
    };

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>{isNew ? "Add New Wine" : "Edit Wine"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-4">
              <label htmlFor="name" className="w-24 text-sm font-medium text-gray-700">Name</label>
              <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="flex-1" />
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="producer" className="w-24 text-sm font-medium text-gray-700">Producer</label>
              <Input id="producer" value={form.producer || ''} onChange={e => setForm({ ...form, producer: e.target.value })} placeholder="Producer" className="flex-1" />
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="grapes" className="w-24 text-sm font-medium text-gray-700">Grapes</label>
              <Input id="grapes" value={form.grapes || ''} onChange={e => setForm({ ...form, grapes: e.target.value })} placeholder="Grapes" className="flex-1" />
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="country" className="w-24 text-sm font-medium text-gray-700">Country</label>
              <Input id="country" value={form.country || ''} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Country" className="flex-1" />
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="region" className="w-24 text-sm font-medium text-gray-700">Region</label>
              <Input id="region" value={form.region || ''} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="Region" className="flex-1" />
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="year" className="w-24 text-sm font-medium text-gray-700">Year</label>
              <Input 
                id="year"
                type="number" 
                value={form.year || ''} 
                onChange={e => setForm({ ...form, year: e.target.value ? parseInt(e.target.value) : null })} 
                placeholder="Year" 
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="price" className="w-24 text-sm font-medium text-gray-700">Price</label>
              <Input 
                id="price"
                type="number" 
                value={form.price || ''} 
                onChange={e => setForm({ ...form, price: e.target.value ? parseFloat(e.target.value) : null })} 
                placeholder="Price" 
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label htmlFor="quantity" className="w-24 text-sm font-medium text-gray-700">Quantity</label>
              <Input 
                id="quantity"
                type="number" 
                value={form.quantity} 
                onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} 
                placeholder="Quantity" 
                className="flex-1"
              />
            </div>
            <div className="flex justify-between space-x-2">
              <Button type="submit" className="w-1/2">Save</Button>
              <Button type="button" onClick={() => isNew ? setIsAdding(false) : setEditingWine(null)} variant="destructive" className="w-1/2">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  const filteredWines = useMemo(() => {
    return wines.filter((wine: Wine) => {
      return Object.entries(filters).every(([key, filter]) => {
        if (!filter) return true;
        const wineValue = wine[key as keyof Wine];
        if (typeof filter === 'string') {
          return String(wineValue).toLowerCase().includes(filter.toLowerCase());
        } else {
          const numericValue = Number(wineValue);
          const filterValue = Number(filter.value);
          switch (filter.operator) {
            case '<': return numericValue < filterValue;
            case '=': return numericValue === filterValue;
            case '>': return numericValue > filterValue;
            default: return true;
          }
        }
      });
    });
  }, [wines, filters]);

  const handleFilterChange = (key: keyof Wine, value: string | NumericFilter) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const renderFilterInput = (key: keyof Wine) => {
    if (['year', 'price', 'quantity'].includes(key)) {
      const filter = (filters[key] as NumericFilter) || { value: '', operator: '=' };
      return (
        <div className="flex items-center mt-1 space-x-1">
          <Select
            value={filter.operator}
            onValueChange={(value) => handleFilterChange(key, { ...filter, operator: value as '<' | '=' | '>' })}
          >
            <SelectTrigger className="w-[60px]">
              <SelectValue placeholder="=" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="<">&lt;</SelectItem>
              <SelectItem value="=">=</SelectItem>
              <SelectItem value=">">&gt;</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={filter.value}
            onChange={(e) => handleFilterChange(key, { ...filter, value: e.target.value })}
            placeholder={`Filter ${key}`}
            className="w-full"
          />
        </div>
      );
    }
    return (
      <Input
        type="text"
        placeholder={`Filter ${key}`}
        value={filters[key] as string || ''}
        onChange={(e) => handleFilterChange(key, e.target.value)}
        className="w-full mt-1"
      />
    );
  };

  const handleLogout = async () => {
    const success = await logoutUser();
    if (success) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/');
    }
  };

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>, wine: Wine) => {
    // Check if the click target is not a button
    if (!(event.target as HTMLElement).closest('button')) {
      setSelectedWine(wine);
    }
  };

  const handleNoteUpdate = (wineId: number, newNote: string) => {
    setWines(prevWines => 
      prevWines.map(wine => 
        wine.id === wineId ? { ...wine, note_text: newNote } : wine
      )
    )
  }

  // Add this useEffect hook for handling scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollButton(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add this function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Wine Cellar</h1>
        {user ? (
          <div className="flex items-center space-x-4">
            <span>Welcome, {user.username}!</span>
            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
          </div>
        ) : (
          <Link href="/login" className="underline">Log in</Link>
        )}
      </header>
      <main>
        {!isAdding && !editingWine && (
          <Button onClick={() => { setIsAdding(true); setEditingWine(null); }} className="mb-4 bg-green-600 hover:bg-green-500">
            Add New Wine
          </Button>
        )}
        {isAdding ? (
          <WineForm wine={newWine} onSave={handleAddAndRefresh} isNew={true} />
        ) : editingWine ? (
          <WineForm wine={editingWine} onSave={(updatedWine) => {
            handleSaveAndRefresh(updatedWine as Wine);
          }} />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {['name', 'producer', 'grapes', 'country', 'region', 'year', 'price', 'quantity'].map((key) => (
                        <TableHead key={key} className="p-2">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                          {renderFilterInput(key as keyof Wine)}
                        </TableHead>
                      ))}
                      <TableHead className="p-2">
                        <Button 
                          onClick={handleResetFilters}
                          variant="outline"
                          className="w-full mt-7 bg-yellow-400 hover:bg-yellow-500 text-black"
                        >
                          Reset Filters
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWines.map((wine) => (
                      <TableRow
                        key={wine.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={(event) => handleRowClick(event, wine)}
                      >
                        <TableCell>{wine.name}</TableCell>
                        <TableCell>{wine.producer}</TableCell>
                        <TableCell>{wine.grapes}</TableCell>
                        <TableCell>{wine.country}</TableCell>
                        <TableCell>{wine.region}</TableCell>
                        <TableCell>{wine.year}</TableCell>
                        <TableCell>{wine.price}</TableCell>
                        <TableCell>{wine.quantity}</TableCell>
                        <TableCell>
                          <div className="flex justify-center items-center space-x-2">
                            <Button
                              className="bg-green-500 hover:bg-green-600 min-w-[100px]"
                              onClick={() => handleEdit(wine)}
                              variant="outline"
                              size="sm"
                            >
                              Edit
                            </Button>
                            <Button
                              className="min-w-[100px]"
                              onClick={() => handleDeleteAndRefresh(wine.id)}
                              variant="destructive"
                              size="sm"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <footer className="mt-8">
        <Link href="/" className="text-primary hover:underline">
          Back to Home
        </Link>
      </footer>
      {selectedWine && (
        <WineDetailsModal
          wine={selectedWine}
          onClose={() => setSelectedWine(null)}
          onNoteUpdate={handleNoteUpdate}
        />
      )}
      {showScrollButton && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 rounded-full shadow-lg"
          size="icon"
        >
          ↑
        </Button>
      )}
    </div>
  );
}
