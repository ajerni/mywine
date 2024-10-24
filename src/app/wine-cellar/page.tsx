'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';

type Wine = {
  id: number;
  name: string;
  producer: string;
  grapes: string;
  country: string;
  region: string;
  year: number;
  price: number;
  quantity: number;
};

const initialWines: Wine[] = [
  { id: 1, name: 'Margaux', producer: 'Château Margaux', grapes: 'Cabernet Sauvignon, Merlot', country: 'France', region: 'Bordeaux', year: 2015, price: 1200, quantity: 3 },
  { id: 2, name: 'Opus One', producer: 'Mondavi', grapes: 'Cabernet Sauvignon, Merlot', country: 'USA', region: 'Napa Valley', year: 2018, price: 350, quantity: 2 },
  { id: 3, name: 'Sassicaia', producer: 'Tenuta San Guido', grapes: 'Cabernet Sauvignon, Cabernet Franc', country: 'Italy', region: 'Tuscany', year: 2017, price: 250, quantity: 1 },
];

export default function WineCellar() {
  const [wines, setWines] = useState<Wine[]>(initialWines);
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newWine, setNewWine] = useState<Omit<Wine, 'id'>>({
    name: '', producer: '', grapes: '', country: '', region: '', year: 0, price: 0, quantity: 0
  });
  const [filters, setFilters] = useState<{[K in keyof Wine]?: string}>({});

  const handleEdit = (wine: Wine) => {
    setEditingWine(wine);
    setIsAdding(false);
  };

  const handleDelete = (id: number) => {
    setWines(wines.filter(wine => wine.id !== id));
  };

  const handleSave = (updatedWine: Wine) => {
    setWines(wines.map(wine => wine.id === updatedWine.id ? updatedWine : wine));
    setEditingWine(null);
  };

  const handleAdd = (newWineData: Omit<Wine, 'id'>) => {
    const id = Math.max(...wines.map(w => w.id), 0) + 1;
    const newWine = { id, ...newWineData };
    setWines([...wines, newWine]);
    setIsAdding(false);
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
          <input value={form.producer} onChange={e => setForm({ ...form, producer: e.target.value })} placeholder="Producer" className="w-full p-1 bg-black border border-red-500 text-white" />
          <input value={form.grapes} onChange={e => setForm({ ...form, grapes: e.target.value })} placeholder="Grapes" className="w-full p-1 bg-black border border-red-500 text-white" />
          <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="Country" className="w-full p-1 bg-black border border-red-500 text-white" />
          <input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} placeholder="Region" className="w-full p-1 bg-black border border-red-500 text-white" />
          <input 
            type="number" 
            value={form.year || ''} 
            onChange={e => setForm({ ...form, year: parseInt(e.target.value) || 0 })} 
            placeholder="Year" 
            className="w-full p-1 bg-black border border-red-500 text-white" 
          />
          <input 
            type="number" 
            value={form.price || ''} 
            onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} 
            placeholder="Price" 
            className="w-full p-1 bg-black border border-red-500 text-white" 
          />
          <input 
            type="number" 
            value={form.quantity || ''} 
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
    return wines.filter(wine => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const wineValue = String(wine[key as keyof Wine]).toLowerCase();
        return wineValue.includes(value.toLowerCase());
      });
    });
  }, [wines, filters]);

  const handleFilterChange = (key: keyof Wine, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({});
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
                    <input
                      type="text"
                      placeholder={`Filter ${key}`}
                      value={filters[key as keyof Wine] || ''}
                      onChange={(e) => handleFilterChange(key as keyof Wine, e.target.value)}
                      className="w-full mt-1 p-1 bg-black border border-red-500 text-white"
                    />
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
