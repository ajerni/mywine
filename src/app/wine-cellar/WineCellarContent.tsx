'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { handleDelete, handleSave, handleAdd } from './wineHandlers';
import { Wine, NumericFilter, User } from './types';
import { useRouter } from 'next/navigation';
import { logoutUser, getCurrentUser } from '../auth/authHandlers';
import { Button } from "@/components/ui/button"
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
      <div className="space-y-2">
        <form onSubmit={handleSubmit} className="space-y-2">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full p-1 bg-black border border-red-500 text-white" />
          <input value={form.producer || ''} onChange={e => setForm({ ...form, producer: e.target.value })} placeholder="Producer" className="w-full p-1 bg-black border border-red-500 text-white" />
          <input value={form.grapes || ''} onChange={e => setForm({ ...form, grapes: e.target.value })} placeholder="Grapes" className="w-full p-1 bg-black border border-red-500 text-white" />
          <input value={form.country || ''} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Country" className="w-full p-1 bg-black border border-red-500 text-white" />
          <input value={form.region || ''} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="Region" className="w-full p-1 bg-black border border-red-500 text-white" />
          <input 
            type="number" 
            value={form.year || ''} 
            onChange={e => setForm({ ...form, year: e.target.value ? parseInt(e.target.value) : null })} 
            placeholder="Year" 
            className="w-full p-1 bg-black border border-red-500 text-white" 
          />
          <input 
            type="number" 
            value={form.price || ''} 
            onChange={e => setForm({ ...form, price: e.target.value ? parseFloat(e.target.value) : null })} 
            placeholder="Price" 
            className="w-full p-1 bg-black border border-red-500 text-white" 
          />
          <input 
            type="number" 
            value={form.quantity} 
            onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })} 
            placeholder="Quantity" 
            className="w-full p-1 bg-black border border-red-500 text-white" 
          />
          <button type="submit" className="bg-green-500 text-black p-2 rounded hover:bg-green-600">Save</button>
        </form>
      </div>
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
        <div className="flex items-center mt-1">
          <select
            value={filter.operator}
            onChange={(e) => handleFilterChange(key, { ...filter, operator: e.target.value as '<' | '=' | '>' })}
            className="p-1 bg-black border border-red-500 text-white"
          >
            <option value="<">&lt;</option>
            <option value="=">=</option>
            <option value=">">&gt;</option>
          </select>
          <input
            type="number"
            value={filter.value}
            onChange={(e) => handleFilterChange(key, { ...filter, value: e.target.value })}
            placeholder=""
            //placeholder={`Filter ${key}`}
            className="w-full ml-1 p-1 bg-black border border-red-500 text-white no-spinner"
          />
        </div>
      );
    }
    return (
      <input
        type="text"
        placeholder=""
        //placeholder={`Filter ${key}`}
        value={filters[key] as string || ''}
        onChange={(e) => handleFilterChange(key, e.target.value)}
        className="w-full mt-1 p-1 bg-black border border-red-500 text-white"
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

  return (
    <div className="min-h-screen bg-black text-red-500 p-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Wine Cellar</h1>
        {user ? (
          <div>
            <span>Welcome, {user.username}!</span>
            <button onClick={handleLogout} className="ml-4 bg-red-500 text-black p-2 rounded hover:bg-red-600">
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login" className="underline">Log in</Link>
        )}
      </header>
      <main>
        {!isAdding && !editingWine && (
          <button onClick={() => { setIsAdding(true); setEditingWine(null); }} className="mb-4 bg-green-500 text-black p-2 rounded hover:bg-green-600">
            Add New Wine
          </button>
        )}
        {isAdding ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Add New Wine</h2>
            <WineForm wine={newWine} onSave={handleAddAndRefresh} isNew={true} />
            <button onClick={() => setIsAdding(false)} className="mt-4 bg-red-500 text-black p-2 rounded hover:bg-red-600">
              Cancel
            </button>
          </div>
        ) : editingWine ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Edit Wine</h2>
            <WineForm wine={editingWine} onSave={(updatedWine) => {
              handleSaveAndRefresh(updatedWine as Wine);
            }} />
            <button onClick={() => setEditingWine(null)} className="mt-4 bg-red-500 text-black p-2 rounded hover:bg-red-600">
              Cancel
            </button>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-red-500">
                {['name', 'producer', 'grapes', 'country', 'region', 'year', 'price', 'quantity'].map((key) => (
                  <th key={key} className="p-2 text-left text-red-500">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    {renderFilterInput(key as keyof Wine)}
                  </th>
                ))}
                <th className="p-2 text-left text-red-500">
                  <button 
                    onClick={handleResetFilters}
                    className="w-full bg-yellow-500 text-black p-1 rounded hover:bg-yellow-600 mt-7"
                  >
                    Reset Filters
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredWines.map((wine) => (
                <tr
                  key={wine.id}
                  className="cursor-pointer hover:bg-gray-800"
                  onClick={(event) => handleRowClick(event, wine)}
                >
                  <td className="p-2 text-white">{wine.name}</td>
                  <td className="p-2 text-white">{wine.producer}</td>
                  <td className="p-2 text-white">{wine.grapes}</td>
                  <td className="p-2 text-white">{wine.country}</td>
                  <td className="p-2 text-white">{wine.region}</td>
                  <td className="p-2 text-white">{wine.year}</td>
                  <td className="p-2 text-white">{wine.price}</td>
                  <td className="p-2 text-white">{wine.quantity}</td>
                  <td className="p-2 flex justify-between">
                    <button onClick={() => handleEdit(wine)} className="w-16 bg-green-700 text-white p-1 rounded hover:bg-green-800 mr-2">Edit</button>
                    <button onClick={() => handleDeleteAndRefresh(wine.id)} className="w-16 bg-red-500 text-black p-1 rounded hover:bg-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
      <footer className="mt-8">
        <Link href="/" className="text-red-500 hover:underline">
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
    </div>
  );
}
