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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { toast } from 'react-toastify';
import { EmptyNameFieldModal } from './EmptyNameFieldModal';
import { cn } from "@/lib/utils";

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
  const [isIOS, setIsIOS] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
  }, []);

  // Add this function to determine if we're in edit/add mode
  const isEditingOrAdding = isAdding || editingWine !== null;

  const fetchWines = async () => {
    try {
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
          // Token expired or invalid
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
      setWines([]); // Reset wines on error
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
      await fetchWines(); // Refresh the wine list after updating
      setEditingWine(null);
      // Scroll window to top on mobile after saving
      if (window.innerWidth < 1024) { // lg breakpoint is 1024px
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
    return success; // Return the success status
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
      
      // Prevent double submission
      if (isSaving) return;
      
      // Check if name is empty
      if (!form.name.trim()) {
        setShowEmptyNameModal(true);
        return;
      }
      
      setIsSaving(true);
      try {
        // Blur any focused input to hide the virtual keyboard
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        // Small delay to ensure keyboard is dismissed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await onSave(form);
      } catch (error) {
        console.error('Error saving wine:', error);
        setIsSaving(false);
      }
    };

    return (
      <>
        <Card className={cn(
          "w-full max-w-md mx-auto",
          isIOS && "ios-form-card"
        )}>
          <CardHeader className={cn(
            "pb-4",
            isIOS && "ios-form-header"
          )}>
            <CardTitle className="text-lg">{isNew ? "Add Wine" : "Edit Wine"}</CardTitle>
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
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button 
                  type="button" 
                  onClick={() => isNew ? setIsAdding(false) : setEditingWine(null)} 
                  variant="outline" 
                  className="w-1/2 text-sm sm:text-base py-2"
                  disabled={isSaving}
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
            <SelectTrigger className="w-[60px] text-black bg-white">
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
            className="w-full no-spinner text-black bg-white"
          />
        </div>
      );
    }
    return (
      <Input
        type="text"
        value={filters[key] as string || ''}
        onChange={(e) => handleFilterChange(key, e.target.value)}
        className="w-full mt-1 text-black bg-white"
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
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setShowScrollButton(target.scrollTop > 300);
    };

    const scrollableContent = document.querySelector('.overflow-y-auto');
    if (scrollableContent) {
      scrollableContent.addEventListener('scroll', handleScroll);
      return () => scrollableContent.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Add scroll to top function
  const scrollToTop = () => {
    const scrollableContent = document.querySelector('.overflow-y-auto');
    if (scrollableContent) {
      scrollableContent.scrollTo({ top: 0, behavior: 'smooth' });
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
      className={cn(
        "flex items-center justify-between border-b border-gray-200",
        isIOS ? "ios-mobile-row" : "py-2 px-2"
      )}
      onClick={(event) => handleRowClick(event, wine)}
    >
      <div className="flex-1 min-w-0 pr-2">
        <div className="font-medium truncate">{wine.name}</div>
        <div className="text-sm text-gray-500 truncate">{wine.producer}</div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-center bg-gray-100 rounded px-3 py-1">
          <span className="text-sm font-medium">{wine.quantity}</span>
        </div>
        <div className={cn(
          "flex gap-1",
          isIOS && "ios-action-buttons"
        )}>
          <Button
            onClick={(e) => { e.stopPropagation(); handleEdit(wine); }}
            className={cn(
              "h-8 w-[70px]",
              isIOS ? "ios-edit-button" : "bg-green-500 hover:bg-green-600"
            )}
            size="sm"
          >
            Edit
          </Button>
          <Button
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(wine); }}
            className={cn(
              "h-8 w-[70px]",
              isIOS ? "ios-delete-button" : ""
            )}
            variant="destructive"
            size="sm"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );

  function WineTable() {
    return (
      <div className={cn(
        "mt-4",
        isIOS && "ios-table-wrapper"
      )}>
        <div className={cn(
          "bg-green-500 rounded-t-lg",
          isIOS && "ios-table-header"
        )}>
          <div className={cn(
            "flex justify-between items-center py-2 px-4",
            isIOS && "ios-table-header-content"
          )}>
            <div className="w-[45%]">Name</div>
            <div className="w-[20%] text-center">Quantity</div>
            <div className="w-[35%]"></div>
          </div>
        </div>
        <div className={cn(
          "bg-white",
          isIOS && "ios-table-content"
        )}>
          {filteredWines.map((wine) => (
            <MobileWineRow key={wine.id} wine={wine} />
          ))}
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

  useEffect(() => {
    if (!isIOS) return;

    // Handle keyboard showing
    const handleKeyboardShow = () => {
      setKeyboardVisible(true);
      document.body.classList.add('keyboard-visible');
    };

    // Handle keyboard hiding
    const handleKeyboardHide = () => {
      setKeyboardVisible(false);
      document.body.classList.remove('keyboard-visible');
    };

    // Add event listeners for iOS keyboard
    window.addEventListener('focusin', handleKeyboardShow);
    window.addEventListener('focusout', handleKeyboardHide);

    return () => {
      window.removeEventListener('focusin', handleKeyboardShow);
      window.removeEventListener('focusout', handleKeyboardHide);
    };
  }, [isIOS]);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        onLogout={handleLogout}
        isEditingOrAdding={isEditingOrAdding}
      />
      <main className={cn(
        "pt-36 sm:pt-40 px-4 sm:px-8 pb-16",
        isIOS && "ios-main-content"
      )}>
        {!isAdding && !editingWine && (
          <>
            {/* Button section - positioned right below header */}
            <div className={cn(
              "mb-4",
              isIOS && "ios-button-section"
            )}>
              <div className="flex justify-between items-center gap-4">
                <Button
                  onClick={() => setIsAdding(true)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={isEditingOrAdding}
                >
                  Add Wine
                </Button>
                
                <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "gap-2",
                        hasActiveFilters(filters) ? "bg-yellow-400 hover:bg-yellow-500" : ""
                      )}
                    >
                      <Menu className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent 
                    side="right" 
                    className={cn(
                      "w-full sm:w-[400px]",
                      isIOS && "ios-filter-sheet"
                    )}
                  >
                    <div className="flex flex-col h-full">
                      {/* Fixed header section */}
                      <div className="sticky top-0 bg-background z-30 pb-4">
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
                      </div>

                      {/* Scrollable content section */}
                      <div className="flex-1 overflow-y-auto">
                        <div className="space-y-4 pb-4 px-2">
                          {['name', 'producer', 'grapes', 'country', 'region', 'year', 'price', 'quantity'].map((key) => (
                            <div key={key} className="space-y-2">
                              <label 
                                htmlFor={key} 
                                className="text-sm font-medium text-gray-700 capitalize"
                              >
                                {key}
                              </label>
                              <div className="pr-2">
                                {renderFilterInput(key as keyof Wine)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Table section */}
            <div className={cn(
              "relative bg-white",
              isIOS && "ios-content-wrapper"
            )}>
              <div className="relative bg-white rounded-t-lg">
                {/* Mobile header - adjusted for iOS */}
                <div className={cn(
                  `sticky top-[185px] z-40 lg:hidden`,
                  isIOS && 'ios-table-header ios-no-scroll'
                )}>
                  <div className="bg-background pb-2">
                    <div className="bg-green-500 rounded-t-lg shadow-sm">
                      <Table className="w-full table-fixed border-collapse">
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[45%] py-1 px-2 text-black first:rounded-tl-lg">Name</TableHead>
                            <TableHead className="w-[20%] py-1 px-2 text-center text-black">Quantity</TableHead>
                            <TableHead className="w-[35%] py-1 px-2 text-right text-black last:rounded-tr-lg"></TableHead>
                          </TableRow>
                        </TableHeader>
                      </Table>
                    </div>
                  </div>
                </div>

                {/* Desktop header with filters */}
                <div className="hidden lg:block sticky top-44 z-20 bg-background">
                  <div className="bg-green-500 rounded-t-lg overflow-hidden">
                    <Table className="w-full table-fixed border-collapse">
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[14%] py-2 px-2 text-black">
                            <div className="space-y-2">
                              <span>Name</span>
                              <Input
                                value={typeof filters.name === 'string' ? filters.name : ''}
                                onChange={(e) => handleFilterChange('name', e.target.value)}
                                className="w-full bg-white"
                              />
                            </div>
                          </TableHead>
                          {/* Repeat for other columns */}
                          {['producer', 'grapes', 'country', 'region', 'year', 'price', 'quantity'].map((key) => (
                            <TableHead 
                              key={key} 
                              className={`w-[${key === 'producer' || key === 'grapes' ? '12' : '10'}%] py-2 px-2 text-black`}
                            >
                              <div className="space-y-2">
                                <span className="capitalize">{key}</span>
                                {renderFilterInput(key as keyof Wine)}
                              </div>
                            </TableHead>
                          ))}
                          <TableHead className="w-[12%] py-2 px-2 text-black">
                            <div className="space-y-2">
                              <span className="invisible">Actions</span>
                              <Button
                                onClick={handleResetFilters}
                                variant="outline"
                                size="sm"
                                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black hover:text-white"
                              >
                                Reset filters
                              </Button>
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                    </Table>
                  </div>
                </div>

                {/* Scrollable table content - adjusted for iOS */}
                <div className={`overflow-y-auto ${isIOS ? 'ios-scroll ios-table-content' : 'max-h-[calc(100vh-340px)] lg:max-h-[calc(100vh-400px)]'}`}>
                  <Table className="w-full table-fixed border-collapse">
                    <TableBody>
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
              </div>
            </div>
          </>
        )}

        {/* Rest of the content (Add/Edit forms) */}
        {isAdding && (
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <WineForm wine={newWine} onSave={handleAddAndRefresh} isNew={true} />
            </div>
          </div>
        )}
        
        {editingWine && (
          <div className={cn(
            "flex justify-center px-2 sm:px-4",
            isIOS && "ios-edit-view"
          )}>
            <div className={cn(
              "w-full max-w-2xl",
              isIOS && "ios-edit-form"
            )}>
              <WineForm 
                wine={editingWine} 
                onSave={async (updatedWine) => {
                  await handleSaveAndRefresh(updatedWine as Wine);
                }} 
                isNew={false} 
              />
            </div>
          </div>
        )}
      </main>
      
      {selectedWine && (
        <WineDetailsModal
          wine={selectedWine}
          onClose={() => setSelectedWine(null)}
          onNoteUpdate={handleNoteUpdate}
          onAiSummaryUpdate={handleAiSummaryUpdate}
          userId={userId!}
          className={isIOS ? 'ios-modal' : ''}
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
      
      {showScrollButton && (
        <button
          onClick={scrollToTop}
          className={cn(
            "fixed p-3 rounded-lg bg-white border border-gray-300 shadow-md",
            "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300",
            "mr-4 sm:mr-8",
            isIOS ? "bottom-[calc(env(safe-area-inset-bottom)+1rem)]" : "bottom-4",
            isIOS && "ios-scroll-top-button"
          )}
          style={{ right: 'max(1rem, calc((100% - 1536px) / 2))' }}
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6 text-gray-600 hover:text-gray-800" />
        </button>
      )}
    </div>
  );
}