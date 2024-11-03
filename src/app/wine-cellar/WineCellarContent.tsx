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
import { ChevronUp, Menu, Loader2 } from 'lucide-react';
import { Header } from "@/components/Header";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { toast } from 'react-toastify';
import { EmptyNameFieldModal } from './EmptyNameFieldModal';

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

// Add this helper function near the top of the component
const hasActiveFilters = (filters: {[key: string]: any}) => {
  return Object.values(filters).some(filter => {
    if (typeof filter === 'string') {
      return filter !== '';
    }
    if (typeof filter === 'object' && filter !== null) {
      return filter.value !== '';
    }
    return false;
  });
};

export default function WineCellarContent({ initialWines }: { initialWines: Wine[] }) {
  const [wines, setWines] = useState<Wine[]>(initialWines);
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newWine, setNewWine] = useState<Omit<Wine, 'id'>>({
    name: '',
    producer: '',
    grapes: '',
    country: '',
    region: '',
    year: null,
    price: null,
    quantity: 0,
    user_id: null,
    note_text: '',
    ai_summary: null
  });
  const [filters, setFilters] = useState<{[K in keyof Wine]?: string | NumericFilter}>({});
  const [user, setUser] = useState<User | null>(null);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const router = useRouter();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [wineToDelete, setWineToDelete] = useState<Wine | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add this function to determine if we're in edit/add mode
  const isEditingOrAdding = isAdding || editingWine !== null;

  const fetchWines = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
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
      setWines([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/users/current', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserId(userData.id);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    // Load user data from localStorage on component mount
    const loadUserAndWines = async () => {
      try {
        // First try to get from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
        
        // Then fetch fresh user data
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
          
          // After confirming we have a user, fetch their wines
          await fetchWines();
        } else if (!storedUser) {
          // If no current user and no stored user, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error loading user and wines:', error);
        router.push('/login');
      }
    };

    loadUserAndWines();
  }, []); // Empty dependency array to run only on mount

  const handleEdit = (wine: Wine) => {
    setEditingWine(wine);
    setIsAdding(false);
  };

  const handleDeleteAndRefresh = async (id: number) => {
    const success = await handleDelete(id);
    if (success) {
      await fetchWines();
    }
    setWineToDelete(null); // Clear the wine to delete after operation
  };

  const handleSaveAndRefresh = async (updatedWine: Wine) => {
    const success = await handleSave(updatedWine);
    if (success) {
      // Store current scroll position
      const scrollPosition = window.scrollY;
      
      await fetchWines(); // Refresh the wine list after updating
      setEditingWine(null);
      
      // For iOS, ensure layout stability
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        // Force layout recalculation
        requestAnimationFrame(() => {
          // Restore scroll position
          window.scrollTo(0, scrollPosition);
          // Force a repaint
          document.body.style.transform = 'translateZ(0)';
          requestAnimationFrame(() => {
            document.body.style.transform = '';
          });
        });
      } else if (window.innerWidth < 1024) { // For other mobile devices
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
    return success;
  };

  const handleAddAndRefresh = async (newWineData: Omit<Wine, 'id'>) => {
    const success = await handleAdd(newWineData);
    if (success) {
      await fetchWines(); // Refresh the wine list after adding
      setIsAdding(false);
      // Scroll window to top on mobile after adding
      if (window.innerWidth < 1024) { // lg breakpoint is 1024px
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  };

  const WineForm = ({ wine, onSave, isNew = false }: { wine: Wine | Omit<Wine, 'id'>, onSave: (wine: Wine | Omit<Wine, 'id'>) => void, isNew?: boolean }) => {
    const [form, setForm] = useState(wine);
    const [showEmptyNameModal, setShowEmptyNameModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Check if name is empty
      if (!form.name.trim()) {
        setShowEmptyNameModal(true);
        return;
      }
      
      setIsSaving(true);
      try {
        await onSave(form);
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <>
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
                  className="w-1/2 bg-green-500 hover:bg-green-600 text-sm sm:text-base py-2 touch-manipulation"
                  disabled={isSaving}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button 
                  type="button" 
                  onClick={() => isNew ? setIsAdding(false) : setEditingWine(null)} 
                  variant="outline" 
                  className="w-1/2 text-sm sm:text-base py-2 touch-manipulation"
                  disabled={isSaving}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {showEmptyNameModal && (
          <EmptyNameFieldModal
            onClose={() => setShowEmptyNameModal(false)}
          />
        )}
      </>
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
    try {
      const success = await logoutUser();
      if (success) {
        setUser(null);
        setWines([]);
        router.push('/login');
      }
    } catch (error) {
      console.error('Error during logout:', error);
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

  const handleDeleteClick = (wine: Wine, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setWineToDelete(wine);
  };

  const MobileWineRow = ({ wine }: { wine: Wine }) => (
    <div 
      className="py-2 px-2 flex items-center justify-between border-b border-gray-200 min-h-[52px]"
      onClick={(event) => handleRowClick(event, wine)}
      style={{ 
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
      }}
    >
      <div className="w-[45%]">{wine.name}</div>
      <div className="w-[20%] text-center">{wine.quantity}</div>
      <div className="w-[35%] flex justify-end items-center space-x-2">
        <Button
          className="bg-green-500 hover:bg-green-600 text-white hover:text-black p-1 w-1/2 touch-manipulation"
          onClick={(e) => { e.stopPropagation(); handleEdit(wine); }}
          variant="outline"
          size="sm"
          style={{ 
            WebkitAppearance: 'none',
            WebkitTransform: 'translateZ(0)',
          }}
        >
          Edit
        </Button>
        <Button
          onClick={(e) => { e.stopPropagation(); handleDeleteClick(wine); }}
          variant="destructive"
          size="sm"
          className="text-white hover:text-black p-1 w-1/2 touch-manipulation"
          style={{ 
            WebkitAppearance: 'none',
            WebkitTransform: 'translateZ(0)',
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );

  function WineTable() {
    if (isLoading) {
      return (
        <div className="mt-4 sm:mt-8 flex flex-col items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
          <p className="text-sm text-gray-500 mt-2">Loading your wine collection...</p>
        </div>
      );
    }

    return (
      <div className="mt-4 sm:mt-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-green-500 text-black">
                <th className="w-[40%] px-2 py-2 text-left sm:w-[50%] lg:hidden">Name</th>
                <th className="w-[30%] px-2 py-2 text-left lg:hidden">Quantity</th>
                <th className="w-[30%] px-2 py-2 text-left sr-only sm:not-sr-only lg:hidden">Actions</th>
                
                <th className="hidden lg:table-cell w-[14%] px-2 py-2 text-left">Name</th>
                <th className="hidden lg:table-cell w-[12%] px-2 py-2 text-left">Producer</th>
                <th className="hidden lg:table-cell w-[12%] px-2 py-2 text-left">Grapes</th>
                <th className="hidden lg:table-cell w-[10%] px-2 py-2 text-left">Country</th>
                <th className="hidden lg:table-cell w-[10%] px-2 py-2 text-left">Region</th>
                <th className="hidden lg:table-cell w-[10%] px-2 py-2 text-left">Year</th>
                <th className="hidden lg:table-cell w-[10%] px-2 py-2 text-left">Price</th>
                <th className="hidden lg:table-cell w-[10%] px-2 py-2 text-left">Quantity</th>
                <th className="hidden lg:table-cell w-[12%] px-2 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWines.map((wine) => (
                <React.Fragment key={wine.id}>
                  <TableRow className="lg:hidden">
                    <TableCell colSpan={3} className="p-0">
                      <MobileWineRow wine={wine} />
                    </TableCell>
                  </TableRow>
                  
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(wine);
                          }}
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

  const handleAiSummaryUpdate = (wineId: number, newSummary: string) => {
    setWines(prevWines => 
      prevWines.map(wine => 
        wine.id === wineId ? { ...wine, ai_summary: newSummary } : wine
      )
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground [screen-orientation:portrait]">
      <Header 
        user={user} 
        onLogout={handleLogout}
        isEditingOrAdding={isEditingOrAdding}
      />
      <main className="pt-36 sm:pt-40 px-4 sm:px-8 pb-16">
        {isLoading ? (
          // Loading spinner for both mobile and desktop
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-green-500" />
            <p className="text-lg text-gray-500 mt-4">Loading your wine collection...</p>
          </div>
        ) : (
          <>
            {!isAdding && !editingWine && (
              <div className="fixed top-36 sm:top-36 left-4 right-4 sm:left-8 sm:right-8 z-20 bg-background">
                <div className="flex justify-between items-center mb-1 sm:mb-4">
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => { setIsAdding(true); setEditingWine(null); }} 
                      className="bg-green-500 hover:bg-green-600 text-black hover:text-white"
                    >
                      Add Wine
                    </Button>
                  </div>
                  <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                    <SheetTrigger asChild>
                      <Button 
                        variant="outline" 
                        className={`${hasActiveFilters(filters) ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                      >
                        <Menu className="h-4 w-4" />
                        <span className="ml-2">Filters</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="flex gap-2 mt-4 mb-6">
                        <Button 
                          onClick={() => setIsFilterSheetOpen(false)}
                          className="w-1/2 bg-green-500 hover:bg-green-600 text-white"
                        >
                          Apply Filters
                        </Button>
                        <Button 
                          onClick={() => {
                            handleResetFilters();
                            setIsFilterSheetOpen(false);
                          }}
                          variant="outline"
                          className="w-1/2 bg-yellow-400 hover:bg-yellow-500 text-black hover:text-white"
                        >
                          Reset Filters
                        </Button>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        <div className="space-y-4">
                          {[
                            { id: 'name', label: 'Name' },
                            { id: 'producer', label: 'Producer' },
                            { id: 'grapes', label: 'Grapes' },
                            { id: 'country', label: 'Country' },
                            { id: 'region', label: 'Region' },
                            { id: 'year', label: 'Year', type: 'number' },
                            { id: 'price', label: 'Price', type: 'number' },
                            { id: 'quantity', label: 'Quantity', type: 'number' }
                          ].map(field => (
                            <div key={field.id} className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">
                                {field.label}
                              </label>
                              {renderFilterInput(field.id as keyof Wine)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <div className="bg-green-500 text-white hidden lg:block rounded-t-lg">
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
                            <div className="font-bold text-black mb-2">{header}</div>
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
            <div className={isAdding || editingWine ? "mt-2" : "mt-[calc(32px+2rem)] sm:mt-[calc(32px+2.5rem+80px)]"}>
              {isAdding ? (
                <div className="flex justify-center">
                  <div className="w-full max-w-2xl">
                    <WineForm wine={newWine} onSave={handleAddAndRefresh} isNew={true} />
                  </div>
                </div>
              ) : editingWine ? (
                <div className="flex justify-center px-2 sm:px-4">
                  <div className="w-full max-w-2xl">
                    <WineForm 
                      wine={editingWine} 
                      onSave={async (updatedWine) => {
                        await handleSaveAndRefresh(updatedWine as Wine);
                      }} 
                      isNew={false} 
                    />
                  </div>
                </div>
              ) : (
                <div className="relative overflow-y-auto lg:max-h-[calc(100vh-400px)] max-h-[calc(100vh-280px)] mt-0 sm:mt-[-20px]">
                  <div className="sticky top-0 z-10 lg:hidden bg-background">
                    <div 
                      className="bg-green-500 rounded-t-lg overflow-hidden mt-2"
                      style={{ 
                        WebkitTransform: 'translateZ(0)',
                        transform: 'translateZ(0)',
                      }}
                    >
                      <Table className="w-full table-fixed border-collapse">
                        <TableHeader>
                          <TableRow>
                            <TableHead 
                              className="w-[45%] py-1 px-2 text-black first:rounded-tl-lg"
                              style={{ height: '40px' }}
                            >
                              Name
                            </TableHead>
                            <TableHead 
                              className="w-[20%] py-1 px-2 text-center text-black"
                              style={{ height: '40px' }}
                            >
                              Quantity
                            </TableHead>
                            <TableHead 
                              className="w-[35%] py-1 px-2 text-right text-black last:rounded-tr-lg"
                              style={{ height: '40px' }}
                            >
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                      </Table>
                    </div>
                  </div>

                  <div className="bg-white">
                    <Table className="w-full table-fixed border-collapse">
                      <TableBody>
                        {filteredWines.map((wine) => (
                          <React.Fragment key={wine.id}>
                            <TableRow className="lg:hidden">
                              <TableCell colSpan={3} className="p-0">
                                <MobileWineRow wine={wine} />
                              </TableCell>
                            </TableRow>
                            
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
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(wine);
                                    }}
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
                  </div>

                  {showScrollButton && (
                    <Button
                      className="fixed bottom-8 right-8 rounded-full p-2 bg-gray-500 hover:bg-gray-700 text-white z-50"
                      onClick={scrollToTop}
                    >
                      <ChevronUp className="h-6 w-6" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
      
      {selectedWine && (
        <WineDetailsModal
          wine={selectedWine}
          onClose={() => setSelectedWine(null)}
          onNoteUpdate={handleNoteUpdate}
          onAiSummaryUpdate={handleAiSummaryUpdate}
          userId={userId!}
        />
      )}
      
      {wineToDelete && (
        <DeleteConfirmationModal
          title="Delete Wine"
          message={`Are you sure you want to delete "${wineToDelete.name}"?`}
          onConfirm={async () => {
            const success = await handleDelete(wineToDelete.id);
            if (success) {
              setWines(prev => prev.filter(w => w.id !== wineToDelete.id));
              setWineToDelete(null);
              toast.success('Wine deleted successfully', { autoClose: 1000 });
            } else {
              toast.error('Failed to delete wine', { autoClose: 1000 });
            }
          }}
          onCancel={() => setWineToDelete(null)}
        />
      )}
    </div>
  );
}