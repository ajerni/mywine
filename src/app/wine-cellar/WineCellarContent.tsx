'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { ChevronUp, Menu } from 'lucide-react';
import { Header } from "@/components/Header";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

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
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

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
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">{isNew ? "Add Wine" : "Edit Wine"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Restructured form fields for better mobile layout */}
            <div className="space-y-3 sm:space-y-4">
              {[
                { id: 'name', label: 'Name', value: form.name },
                { id: 'producer', label: 'Producer', value: form.producer || '' },
                { id: 'grapes', label: 'Grapes', value: form.grapes || '' },
                { id: 'country', label: 'Country', value: form.country || '' },
                { id: 'region', label: 'Region', value: form.region || '' },
                { id: 'year', label: 'Year', value: form.year || '', type: 'number' },
                { id: 'price', label: 'Price', value: form.price || '', type: 'number' },
                { id: 'quantity', label: 'Quantity', value: form.quantity, type: 'number' }
              ].map(field => (
                <div key={field.id} className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <label 
                    htmlFor={field.id} 
                    className="text-sm font-medium text-gray-700 mb-1 sm:mb-0 sm:w-24"
                  >
                    {field.label}
                  </label>
                  <Input
                    id={field.id}
                    type={field.type || 'text'}
                    value={field.value}
                    onChange={e => {
                      const value = field.type === 'number' 
                        ? (e.target.value ? Number(e.target.value) : null)
                        : e.target.value;
                      setForm({ ...form, [field.id]: value });
                    }}
                    placeholder={field.label}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
            
            <div className="flex justify-between space-x-2 pt-2">
              <Button 
                type="submit" 
                className="w-1/2 bg-green-500 hover:bg-green-600 text-sm sm:text-base py-2"
              >
                Save
              </Button>
              <Button 
                type="button" 
                onClick={() => isNew ? setIsAdding(false) : setEditingWine(null)} 
                variant="destructive" 
                className="w-1/2 text-sm sm:text-base py-2"
              >
                Cancel
              </Button>
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
    setIsFilterSheetOpen(false); // Close the filter sheet after resetting
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
            <SelectTrigger className="w-[60px] text-black">
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
            className="w-full no-spinner text-black"
          />
        </div>
      );
    }
    return (
      <Input
        type="text"
        value={filters[key] as string || ''}
        onChange={(e) => handleFilterChange(key, e.target.value)}
        className="w-full mt-1 text-black"
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

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement | HTMLDivElement>, wine: Wine) => {
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

  // Update this useEffect hook to handle scroll
  useEffect(() => {
    const tableBody = document.querySelector('.overflow-y-auto');
    if (!tableBody) return;

    const handleScroll = () => {
      setShowScrollButton(tableBody.scrollTop > 300); // Show button when scrolled down 300px
    };

    tableBody.addEventListener('scroll', handleScroll);
    return () => tableBody.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function remains the same
  const scrollToTop = () => {
    const tableBody = document.querySelector('.overflow-y-auto');
    if (tableBody) {
      tableBody.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const MobileWineRow = ({ wine }: { wine: Wine }) => (
    <div 
      className="py-2 px-2 flex items-center justify-between border-b border-gray-200"
      onClick={(event) => handleRowClick(event, wine)}
    >
      <div className="w-1/2">{wine.name}</div>
      <div className="w-1/6 text-center">{wine.quantity}</div>
      <div className="w-1/3 flex justify-end items-center space-x-2">
        <Button
          className="bg-green-500 hover:bg-green-600 text-white hover:text-black p-1 w-1/2"
          onClick={(e) => { e.stopPropagation(); handleEdit(wine); }}
          variant="outline"
          size="sm"
        >
          Edit
        </Button>
        <Button
          onClick={(e) => { e.stopPropagation(); handleDeleteAndRefresh(wine.id); }}
          variant="destructive"
          size="sm"
          className="text-white hover:text-black p-1 w-1/2"
        >
          Delete
        </Button>
      </div>
    </div>
  );

  function WineTable() {
    return (
      <div className="mt-4 sm:mt-8"> {/* Reduced top margin on mobile */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-red-500 text-white">
                <th className="w-[40%] px-2 py-2 text-left sm:w-[50%]">Name</th> {/* Adjusted width for mobile */}
                <th className="w-[30%] px-2 py-2 text-left">Quantity</th>
                <th className="w-[30%] px-2 py-2 text-left sr-only sm:not-sr-only">Actions</th> {/* Hide "Actions" text on mobile */}
              </tr>
            </thead>
            <tbody>
              {filteredWines.map((wine) => (
                <React.Fragment key={wine.id}>
                  {/* Mobile view */}
                  <TableRow className="lg:hidden">
                    <TableCell colSpan={3} className="p-0">
                      <MobileWineRow wine={wine} />
                    </TableCell>
                  </TableRow>
                  
                  {/* Desktop view */}
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50 border-t border-gray-200 hidden lg:table-row"
                    onClick={(event) => handleRowClick(event, wine)}
                  >
                    <TableCell className="text-left py-3 px-2 w-[14%]">{wine.name}</TableCell>
                    <TableCell className="text-left py-3 px-2 w-[12%]">{wine.producer}</TableCell>
                    <TableCell className="text-left py-3 px-2 w-[12%]">{wine.grapes}</TableCell>
                    <TableCell className="text-left py-3 px-2 w-[10%]">{wine.country}</TableCell>
                    <TableCell className="text-left py-3 px-2 w-[10%]">{wine.region}</TableCell>
                    <TableCell className="text-left py-3 px-2 w-[10%]">{wine.year}</TableCell>
                    <TableCell className="text-left py-3 px-2 w-[10%]">{wine.price}</TableCell>
                    <TableCell className="text-left py-3 px-2 w-[10%]">{wine.quantity}</TableCell>
                    <TableCell className="py-3 px-2 w-[12%]">
                      <div className="flex justify-between items-center space-x-2">
                        <Button
                          className="bg-green-500 hover:bg-green-600 w-1/2 text-white hover:text-black"
                          onClick={() => handleEdit(wine)}
                          variant="outline"
                          size="sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteAndRefresh(wine.id)}
                          variant="destructive"
                          size="sm"
                          className="w-1/2 text-white hover:text-black"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header user={user} onLogout={handleLogout} />
      {/* Reduce top padding for mobile */}
      <main className="pt-20 sm:pt-40 px-4 sm:px-8 pb-16">
        {!isAdding && !editingWine && (
          // Reduce top position for mobile
          <div className="fixed top-20 sm:top-36 left-4 right-4 sm:left-8 sm:right-8 z-20 bg-background">
            <div className="flex justify-between items-center mb-2 sm:mb-4"> {/* Reduce margin bottom for mobile */}
              <Button 
                onClick={() => { setIsAdding(true); setEditingWine(null); }} 
                className="bg-green-600 hover:bg-green-500"
              >
                Add Wine
              </Button>
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Menu className="h-4 w-4" />
                    <span className="ml-2">Filters</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <div className="space-y-2 mt-2">
                      <Button 
                        onClick={() => setIsFilterSheetOpen(false)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                      >
                        Apply Filters
                      </Button>
                      <Button 
                        onClick={handleResetFilters}
                        variant="outline"
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-black hover:text-white"
                      >
                        Reset Filters
                      </Button>
                    </div>
                  </SheetHeader>
                  <div className="flex-grow overflow-y-auto mt-4">
                    <div className="space-y-4 pb-4 px-2"> {/* Added px-2 for left padding */}
                      {['name', 'producer', 'grapes', 'country', 'region', 'year', 'price', 'quantity'].map((key) => (
                        <div key={key} className="space-y-2">
                          <label htmlFor={key} className="text-sm font-medium text-gray-700 capitalize">{key}</label>
                          <div className="pr-2">
                            {renderFilterInput(key as keyof Wine)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="bg-red-500 text-white hidden lg:block">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {[
                      { header: 'NAME', width: 'w-[14%]' },
                      { header: 'PRODUCER', width: 'w-[12%]' },
                      { header: 'GRAPES', width: 'w-[12%]' },
                      { header: 'COUNTRY', width: 'w-[10%]' },
                      { header: 'REGION', width: 'w-[10%]' },
                      { header: 'YEAR', width: 'w-[10%]' },
                      { header: 'PRICE', width: 'w-[10%]' },
                      { header: 'QUANTITY', width: 'w-[10%]' },
                      { header: '', width: 'w-[12%]' }
                    ].map(({ header, width }) => (
                      <TableHead key={header} className={`p-2 text-left ${width}`}>
                        <div className="font-bold text-white mb-2">{header}</div>
                        {header !== '' ? (
                          renderFilterInput(header.toLowerCase() as keyof Wine)
                        ) : (
                          <Button 
                            onClick={handleResetFilters}
                            variant="outline"
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black hover:text-white h-10 mt-5"
                          >
                            Reset Filters
                          </Button>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
          </div>
        )}
        <div className={isAdding || editingWine ? "mt-2" : "mt-[calc(32px+2.5rem+80px)] sm:mt-[calc(32px+2.5rem+130px)]"}> {/* Reduce margin top for mobile */}
          {isAdding ? (
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <WineForm wine={newWine} onSave={handleAddAndRefresh} isNew={true} />
              </div>
            </div>
          ) : editingWine ? (
            <div className="flex justify-center px-2 sm:px-4"> {/* Added padding for mobile */}
              <div className="w-full max-w-2xl">
                <WineForm 
                  wine={editingWine} 
                  onSave={(updatedWine) => {
                    handleSaveAndRefresh(updatedWine as Wine);
                  }} 
                  isNew={false} 
                />
              </div>
            </div>
          ) : (
            <div className="relative overflow-y-auto max-h-[calc(100vh-400px)] -mt-[80px]">
              {/* Mobile header - Updated with sticky positioning */}
              <div className="sticky top-0 z-10 lg:hidden">
                <div className="bg-red-500 rounded-t-lg overflow-hidden">
                  <Table className="w-full table-fixed border-collapse">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/2 py-2 px-2 text-white first:rounded-tl-lg">Name</TableHead>
                        <TableHead className="w-1/6 py-2 px-2 text-center text-white">Quantity</TableHead>
                        <TableHead className="w-1/3 py-2 px-2 text-right text-white last:rounded-tr-lg">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>
              </div>

              {/* Rest of the table body remains the same */}
              <Table className="w-full table-fixed border-collapse">
                <TableBody className="bg-white">
                  {filteredWines.map((wine) => (
                    <React.Fragment key={wine.id}>
                      {/* Mobile view */}
                      <TableRow className="lg:hidden">
                        <TableCell colSpan={3} className="p-0">
                          <MobileWineRow wine={wine} />
                        </TableCell>
                      </TableRow>
                      
                      {/* Desktop view */}
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50 border-t border-gray-200 hidden lg:table-row"
                        onClick={(event) => handleRowClick(event, wine)}
                      >
                        <TableCell className="text-left py-3 px-2 w-[14%]">{wine.name}</TableCell>
                        <TableCell className="text-left py-3 px-2 w-[12%]">{wine.producer}</TableCell>
                        <TableCell className="text-left py-3 px-2 w-[12%]">{wine.grapes}</TableCell>
                        <TableCell className="text-left py-3 px-2 w-[10%]">{wine.country}</TableCell>
                        <TableCell className="text-left py-3 px-2 w-[10%]">{wine.region}</TableCell>
                        <TableCell className="text-left py-3 px-2 w-[10%]">{wine.year}</TableCell>
                        <TableCell className="text-left py-3 px-2 w-[10%]">{wine.price}</TableCell>
                        <TableCell className="text-left py-3 px-2 w-[10%]">{wine.quantity}</TableCell>
                        <TableCell className="py-3 px-2 w-[12%]">
                          <div className="flex justify-between items-center space-x-2">
                            <Button
                              className="bg-green-500 hover:bg-green-600 w-1/2 text-white hover:text-black"
                              onClick={() => handleEdit(wine)}
                              variant="outline"
                              size="sm"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteAndRefresh(wine.id)}
                              variant="destructive"
                              size="sm"
                              className="w-1/2 text-white hover:text-black"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
              
              {showScrollButton && (
                <Button
                  className="fixed bottom-8 right-8 rounded-full p-2 bg-red-500 hover:bg-red-600 text-white z-50"
                  onClick={scrollToTop}
                >
                  <ChevronUp className="h-6 w-6" />
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
      
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
