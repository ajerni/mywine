'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';

type Wine = {
  id: number;
  name: string;
  producer: string | null;
  grapes: string | null;
  country: string | null;
  region: string | null;
  year: number | null;
  price: number | null;
  quantity: number;
};

type NumericFilter = {
  value: string;
  operator: '<' | '=' | '>';
};

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

export default function WineCellarContent() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newWine, setNewWine] = useState<Omit<Wine, 'id'>>({
    name: '', producer: '', grapes: '', country: '', region: '', year: null, price: null, quantity: 0
  });
  const [filters, setFilters] = useState<{[K in keyof Wine]?: string | NumericFilter}>({});

  useEffect(() => {
    fetchWines();
  }, []);

  const fetchWines = async () => {
    try {
      const response = await fetch('/api/wines');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setWines(data);
      } else {
        logError('Unexpected data format:', data);
        setWines([]);
      }
    } catch (error) {
      logError('Error fetching wines:', error);
      setWines([]);
    }
  };

  const handleEdit = (wine: Wine) => {
    setEditingWine(wine);
    setIsAdding(false);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch('/api/wines', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchWines();
    } catch (error) {
      logError('Error deleting wine:', error);
    }
  };

  const handleSave = async (updatedWine: Wine) => {
    try {
      const response = await fetch('/api/wines', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedWine),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchWines();
      setEditingWine(null);
    } catch (error) {
      logError('Error updating wine:', error);
    }
  };

  const handleAdd = async (newWineData: Omit<Wine, 'id'>) => {
    try {
      const response = await fetch('/api/wines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWineData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}, details: ${errorData.details}`);
      }
      fetchWines();
      setIsAdding(false);
    } catch (error) {
      logError('Error adding wine:', error);
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
    return Array.isArray(wines) ? wines.filter((wine: Wine) => {
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
    }) : [];
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
            placeholder={`Filter ${key}`}
            className="w-full ml-1 p-1 bg-black border border-red-500 text-white no-spinner"
          />
        </div>
      );
    }
    return (
      <input
        type="text"
        placeholder={`Filter ${key}`}
        value={filters[key] as string || ''}
        onChange={(e) => handleFilterChange(key, e.target.value)}
        className="w-full mt-1 p-1 bg-black border border-red-500 text-white"
      />
    );
  };

  return (
    <div className="min-h-screen bg-black text-red-500 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Your Wine Cellar</h1>
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
            <WineForm wine={newWine} onSave={handleAdd} isNew={true} />
            <button onClick={() => setIsAdding(false)} className="mt-4 bg-red-500 text-black p-2 rounded hover:bg-red-600">
              Cancel
            </button>
          </div>
        ) : editingWine ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Edit Wine</h2>
            <WineForm wine={editingWine} onSave={(updatedWine) => {
              handleSave(updatedWine as Wine);
              setEditingWine(null);
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
                    className="w-full bg-yellow-500 text-black p-1 rounded hover:bg-yellow-600"
                  >
                    Reset Filters
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredWines.map((wine) => (
                <tr key={wine.id} className="border-b border-red-500 hover:bg-red-900">
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
                    <button onClick={() => handleDelete(wine.id)} className="w-16 bg-red-500 text-black p-1 rounded hover:bg-red-600">Delete</button>
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
    </div>
  );
}
