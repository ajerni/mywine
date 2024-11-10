'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { handleDelete, handleSave, handleAdd } from './wineHandlers';
import { Wine, NumericFilter, User } from './types';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../auth/authHandlers';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WineDetailsModal } from './WineDetailsModal';
import { ChevronUp, Menu, Loader2, X, MessageSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { toast } from 'react-toastify';
import { EmptyNameFieldModal } from './EmptyNameFieldModal';
import { useIsMobile } from '@/hooks/useIsMobile';

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

// Add this helper function near the top of the file
function preventOverscroll(element: HTMLElement) {
  let startY = 0;
  
  element.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
  }, { passive: false });

  element.addEventListener('touchmove', (e) => {
    const deltaY = e.touches[0].pageY - startY;
    const scrollTop = element.scrollTop;
    const contentHeight = element.scrollHeight;
    const visibleHeight = element.clientHeight;

    // Prevent scrolling up when already at the top
    if (deltaY > 0 && scrollTop <= 0) {
      e.preventDefault();
    }
    
    // Prevent scrolling down when already at the bottom
    if (deltaY < 0 && scrollTop + visibleHeight >= contentHeight) {
      e.preventDefault();
    }
  }, { passive: false });
}

const MobileWineList = ({ wines, onEdit, onDelete, onRowClick }: {
  wines: Wine[];
  onEdit: (wine: Wine) => void;
  onDelete: (wine: Wine, e?: React.MouseEvent) => void;
  onRowClick: (event: React.MouseEvent<HTMLDivElement>, wine: Wine) => void;
}) => (
  <div className="divide-y divide-gray-200">
    {wines.map((wine) => (
      <div 
        key={wine.id}
        className="flex items-center pl-4 pr-1 py-3 hover:bg-gray-50 active:bg-gray-100 ios-button-alignment"
        onClick={(event) => onRowClick(event, wine)}
      >
        <div className="flex-1 min-w-0 pr-2">
          <div className="truncate text-base sm:text-lg font-medium">{wine.name}</div>
        </div>
        
        <div className="w-[50px] text-center text-base sm:text-lg font-medium">
          {wine.quantity}
        </div>
        
        <div className="w-[110px] flex items-center gap-1 justify-end">
          <Button
            onClick={(e) => { 
              e.stopPropagation(); 
              onEdit(wine); 
            }}
            className="bg-green-500 hover:bg-green-600 text-white h-8 w-[52px]"
            size="sm"
          >
            Edit
          </Button>
          <Button
            onClick={(e) => { 
              e.stopPropagation(); 
              onDelete(wine, e); 
            }}
            variant="destructive"
            className="h-8 w-[52px]"
            size="sm"
          >
            Delete
          </Button>
        </div>
      </div>
    ))}
  </div>
);

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
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const router = useRouter();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [wineToDelete, setWineToDelete] = useState<Wine | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isMobile = useIsMobile();

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
    const loadUserAndWines = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch current user data
        const user = await getCurrentUser();
        if (user) {
          setUserId(user.id);
          setCurrentUser(user); // Make sure we set the currentUser state
          await fetchWines();
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error loading user and wines:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserAndWines();
  }, []);

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
      await fetchWines();
      setEditingWine(null);
      
      
      // iOS-specific layout stabilization
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        // Force stable viewport
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        document.body.style.setProperty('height', '100%', 'important');
        document.body.style.setProperty('position', 'fixed', 'important');
        document.body.style.setProperty('width', '100%', 'important');
        
        // Reset after a brief delay
        setTimeout(() => {
          document.body.style.removeProperty('position');
          document.body.style.removeProperty('height');
          document.body.style.removeProperty('width');
          window.scrollTo(0, 0);
        }, 100);
      } else if (window.innerWidth < 1024) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
    return success;
  };

  const handleAddAndRefresh = async (newWineData: Omit<Wine, 'id'>) => {
    const success = await handleAdd(newWineData);
    if (success) {
      await fetchWines();
      setIsAdding(false);
     
      
      // iOS-specific layout stabilization
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
        document.body.style.setProperty('height', '100%', 'important');
        document.body.style.setProperty('position', 'fixed', 'important');
        document.body.style.setProperty('width', '100%', 'important');
        
        setTimeout(() => {
          document.body.style.removeProperty('position');
          document.body.style.removeProperty('height');
          document.body.style.removeProperty('width');
          window.scrollTo(0, 0);
        }, 100);
      } else if (window.innerWidth < 1024) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }
  };

  const WineForm = ({ wine, onSave, isNew = false }: { 
    wine: Wine | Omit<Wine, 'id'>, 
    onSave: (wine: Wine | Omit<Wine, 'id'>) => void, 
    isNew?: boolean 
  }) => {
    const [form, setForm] = useState(wine);
    const [showEmptyNameModal, setShowEmptyNameModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
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
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col w-full space-y-4"
      >
        {/* Form Fields */}
        <div className="space-y-4">
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
            <div key={field.id} className="flex items-center gap-4">
              <label 
                htmlFor={field.id} 
                className="text-sm font-medium text-gray-700 w-24 flex-shrink-0"
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

        {/* Buttons Container */}
        <div 
          className="flex gap-4 pt-2"
          style={{
            paddingBottom: (/iPhone|iPad|iPod/.test(navigator.userAgent))
              ? 'env(safe-area-inset-bottom, 20px)'
              : '0'
          }}
        >
          <Button 
            type="submit" 
            className="flex-1 bg-green-500 hover:bg-green-600 text-white h-12"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button 
            type="button" 
            onClick={() => isNew ? setIsAdding(false) : setEditingWine(null)} 
            variant="outline" 
            className="flex-1 h-12"
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>

        {showEmptyNameModal && (
          <EmptyNameFieldModal onClose={() => setShowEmptyNameModal(false)} />
        )}
      </form>
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
        <div className="flex items-center gap-2">
          <Select
            value={filter.operator}
            onValueChange={(value) => handleFilterChange(key, { ...filter, operator: value as '<' | '=' | '>' })}
          >
            <SelectTrigger className="w-[36px] text-black min-w-[36px]">
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
            className="w-[64px] min-w-[64px] text-black no-spinner"
          />
        </div>
      );
    }
    return (
      <Input
        type="text"
        value={filters[key] as string || ''}
        onChange={(e) => handleFilterChange(key, e.target.value)}
        className="w-full text-black"
      />
    );
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






  const handleDeleteClick = (wine: Wine, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setWineToDelete(wine);
  };

  const MobileWineRow = ({ wine }: { wine: Wine }) => (
    <div 
      className="flex items-center justify-between min-h-[52px]"
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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
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
                <th className="w-[40%] px-4 py-3 text-left sm:w-[50%] lg:hidden">Name</th>
                <th className="w-[30%] px-4 py-3 text-left lg:hidden">Quantity</th>
                <th className="w-[30%] px-4 py-3 text-left sr-only sm:not-sr-only lg:hidden">Actions</th>
                
                <th className="hidden lg:table-cell w-[14%] px-4 py-3 text-left">Name</th>
                <th className="hidden lg:table-cell w-[12%] px-4 py-3 text-left">Producer</th>
                <th className="hidden lg:table-cell w-[12%] px-4 py-3 text-left">Grapes</th>
                <th className="hidden lg:table-cell w-[10%] px-4 py-3 text-left">Country</th>
                <th className="hidden lg:table-cell w-[10%] px-4 py-3 text-left">Region</th>
                <th className="hidden lg:table-cell w-[10%] px-4 py-3 text-left">Year</th>
                <th className="hidden lg:table-cell w-[10%] px-4 py-3 text-left">Price</th>
                <th className="hidden lg:table-cell w-[10%] px-4 py-3 text-left">Quantity</th>
               
              </tr>
            </thead>
            <tbody>
              {filteredWines.map((wine, rowIndex) => (
                <TableRow
                  key={wine.id}
                  className={`cursor-pointer hover:bg-muted/50 hidden lg:table-row
                    ${rowIndex === 0 ? 'pt-4' : ''} 
                    ${rowIndex === filteredWines.length - 1 ? 'pb-4' : ''}`}
                  onClick={(event) => handleRowClick(event, wine)}
                >
                  {columns.map(({ header, key, width, className }) => 
                    key !== 'actions' ? (
                      <TableCell 
                        key={key}
                        className={`text-left py-3 ${width} ${className || ''}`}
                      >
                        {wine[key]}
                      </TableCell>
                    ) : null
                  )}
                  <TableCell className="py-3 pl-4 w-[3%]">
                    <div className="flex justify-end items-right gap-1">
                      <Button
                        className="bg-green-500 hover:bg-green-600 text-white hover:text-black w-[70px]"
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
                        className="text-white hover:text-black w-[70px]"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
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

  // Update the handleFilterSheetClose function
  const handleFilterSheetClose = () => {
    setIsFilterSheetOpen(false);
    
    // Simplified iOS layout handling
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      window.scrollTo(0, 0);
    }
  };

  // Add this effect to handle initial iOS layout
  useEffect(() => {
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      const handleResize = () => {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      };
      
      handleResize();
      window.addEventListener('resize', handleResize);
      
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Add this ref for the table container
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollableContent = scrollableContentRef.current;
    if (!scrollableContent) return;

    const handleScroll = () => {
      const shouldShow = scrollableContent.scrollTop > 100;
      console.log('Scroll position:', scrollableContent.scrollTop, 'Show button:', shouldShow);
      setShowScrollToTop(shouldShow);
    };

    scrollableContent.addEventListener('scroll', handleScroll);
    return () => scrollableContent.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    const scrollableContent = scrollableContentRef.current;
    if (scrollableContent) {
      scrollableContent.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Update the column structure with proper alignment
  interface Column {
    header: string | React.ReactElement;
    key: keyof Wine | 'actions';
    width: string;
    className?: string;
  }

  const columns: Column[] = [
    { header: 'NAME', key: 'name', width: 'w-[15%]' },
    { header: 'PRODUCER', key: 'producer', width: 'w-[14%]' },
    { header: 'GRAPES', key: 'grapes', width: 'w-[13%]' },
    { header: 'COUNTRY', key: 'country', width: 'w-[10%]' },
    { header: 'REGION', key: 'region', width: 'w-[10%]' },
    { header: 'YEAR', key: 'year', width: 'w-[10%]' },
    { header: 'PRICE', key: 'price', width: 'w-[10%]' },
    { header: 'QUANTITY', key: 'quantity', width: 'w-[8%]' },
    { header: '', key: 'actions', width: 'w-[10%]' }
  ];

  // Add this near your other refs
  const scrollableContentRef = useRef<HTMLDivElement>(null);

  // Add this useEffect to implement the overscroll prevention
  useEffect(() => {
    const scrollableContent = scrollableContentRef.current;
    if (scrollableContent) {
      preventOverscroll(scrollableContent);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background relative ios-safe-height">
      <main className="fixed inset-x-0 top-[7rem] bottom-0 flex flex-col ios-fixed-layout">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            <p className="text-sm text-gray-500 mt-2">Loading your wine collection...</p>
          </div>
        ) : (
          <>
            {isAdding || editingWine ? (
              <div 
                className="fixed inset-0 flex flex-col bg-background ios-form-wrapper"
                style={{
                  top: '7rem',
                  height: 'calc(100% - 7rem)',
                  maxHeight: '-webkit-fill-available'
                }}
              >
                {/* Form Header - Reduce padding */}
                <div className="flex-none px-6 lg:px-8 py-2 lg:ml-12 bg-background border-b">
                  <div className="w-full max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold">
                      {isAdding ? "Add Wine" : "Edit Wine"}
                    </h2>
                  </div>
                </div>

                {/* Form Scroll Container - Adjust padding and scroll behavior */}
                <div 
                  className="flex-1 overflow-y-auto ios-form-scroll"
                  style={{
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehavior: 'none',
                    paddingTop: '1rem',
                    ...((/iPhone|iPad|iPod/.test(navigator.userAgent)) && {
                      paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 4rem)'
                    })
                  }}
                >
                  <div className="px-6 lg:px-8 w-full max-w-2xl mx-auto">
                    <WineForm 
                      wine={isAdding ? newWine : editingWine!} 
                      onSave={async (wine) => {
                        if (isAdding) {
                          await handleAddAndRefresh(wine as Omit<Wine, 'id'>);
                        } else {
                          await handleSaveAndRefresh(wine as Wine);
                        }
                      }}
                      isNew={isAdding}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full ios-content-wrapper">
                {/* Fixed Header Section - Always visible */}
                <div className="fixed top-[7rem] left-0 right-0 z-50 bg-background px-4 sm:px-6 lg:px-8 ios-fixed-header">
                  {/* Buttons Section */}
                  <div className="py-4 flex justify-between items-center border-b bg-background">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => { 
                          setIsAdding(true); 
                          setEditingWine(null);
                          setNewWine({
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
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        Add Wine
                      </Button>
                      
                      {/* New AI Chat button - only shown for pro users */}
                      {currentUser?.has_proaccount && (
                        <Button
                          onClick={() => {
                            console.log('AI Chat clicked');
                            // Add your AI Chat functionality here
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          AI Chat
                        </Button>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => setIsFilterSheetOpen(true)}
                      className={`flex items-center gap-2 ${
                        hasActiveFilters(filters) ? 'bg-yellow-400 hover:bg-yellow-500' : ''
                      }`}
                    >
                      <Menu className="h-4 w-4" />
                      Filters
                    </Button>
                  </div>

                  {/* Table Headers Container */}
                  <div className="rounded-md overflow-hidden">
                    <div className="bg-green-500">
                      {/* Mobile Table Header */}
                      <div className="lg:hidden">
                        <div className="py-3 flex items-center text-black font-semibold bg-green-500">
                          <div className="flex-1 min-w-0 pl-4 text-base sm:text-lg">NAME</div>
                          <div className="w-[50px] text-center text-base sm:text-lg">QTY</div>
                          <div className="w-[110px] invisible">ACTIONS</div>
                        </div>
                      </div>

                      {/* Desktop Table Header */}
                      <div className="hidden lg:block">
                        <table className="w-full table-fixed">
                          <thead>
                            <tr>
                              {columns.map(({ header, key, width, className }) => (
                                <th 
                                  key={key}
                                  className={`${width} py-3 text-black font-semibold ${
                                    ['year', 'price', 'quantity'].includes(key) 
                                      ? `text-left pl-3 ${className || ''}`
                                      : 'text-left pl-4'
                                  }`}
                                >
                                  <div className="mb-2">{header}</div>
                                  {key !== 'actions' && (
                                    <div className="flex items-center">
                                      {renderFilterInput(key as keyof Wine)}
                                    </div>
                                  )}
                                </th>
                              ))}
                            </tr>
                          </thead>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scrollable Content Area */}
                <div 
                  ref={scrollableContentRef}
                  className="overflow-y-auto w-full ios-scrollable-content"
                  style={{ 
                    height: 'calc(100vh - 5rem)',
                    paddingTop: 'calc(4.5rem + 2.75rem + 0.5rem)',
                    paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 20px))'
                  }}
                >
                  {/* Mobile List View */}
                  <div className="lg:hidden px-4 sm:px-6">
                    <MobileWineList
                      wines={filteredWines}
                      onEdit={(wine) => {
                        setEditingWine(wine);
                        setIsAdding(false);
                      }}
                      onDelete={handleDeleteClick}
                      onRowClick={(event, wine) => handleRowClick(event, wine)}
                    />
                  </div>

                  {/* Desktop Table Body */}
                  <div 
                    className="hidden lg:block px-8"
                    style={{
                      paddingTop: 'calc(2rem)',
                    }}
                  >
                    <table className="w-full table-fixed">
                      <tbody>
                        {filteredWines.map((wine, index) => (
                          <tr
                            key={wine.id}
                            onClick={(event) => handleRowClick(event, wine)}
                            className="cursor-pointer hover:bg-gray-50 border-b border-gray-200"
                          >
                            <td className="py-3 pl-4 w-[15%] truncate">{wine.name}</td>
                            <td className="py-3 pl-4 w-[14%] truncate">{wine.producer}</td>
                            <td className="py-3 pl-4 w-[13%] truncate">{wine.grapes}</td>
                            <td className="py-3 pl-4 w-[10%] truncate">{wine.country}</td>
                            <td className="py-3 pl-4 w-[10%] truncate">{wine.region}</td>
                            <td className="py-3 w-[10%] text-center">{wine.year}</td>
                            <td className="py-3 w-[10%] text-center">{wine.price}</td>
                            <td className="py-3 w-[8%] text-center">{wine.quantity}</td>
                            <td className="py-3 px-2 w-[10%]">
                              <div className="flex justify-end gap-2">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEdit(wine);
                                  }}
                                  className="bg-green-500 hover:bg-green-600 text-white w-[60px]"
                                  size="sm"
                                >
                                  Edit
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(wine, e);
                                  }}
                                  variant="destructive"
                                  size="sm"
                                  className="w-[60px]"
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modals */}
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
              await handleDeleteAndRefresh(wineToDelete.id);
            }}
            onCancel={() => setWineToDelete(null)}
          />
        )}

        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
          <SheetContent 
            side="right" 
            className="w-full sm:max-w-md p-0 flex flex-col bg-white ios-sheet-content"
            style={{
              ...((/iPhone|iPad|iPod/.test(navigator.userAgent)) && {
                height: '100%',
                maxHeight: '-webkit-fill-available'
              })
            }}
          >
            {/* Fixed Header Section */}
            <div className="flex-none border-b bg-white px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Filters</h2>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    handleFilterSheetClose();
                  }}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white h-11"
                >
                  Apply Filters
                </Button>
                <Button 
                  onClick={() => {
                    handleResetFilters();
                    handleFilterSheetClose();
                  }}
                  variant="outline"
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black hover:text-black h-11"
                >
                  Reset Filters
                </Button>
              </div>
            </div>

            {/* Scrollable Filter Fields */}
            <div 
              className="flex-1 overflow-y-auto"
              style={{
                ...((/iPhone|iPad|iPod/.test(navigator.userAgent)) && {
                  paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 60px)',
                  WebkitOverflowScrolling: 'touch'
                })
              }}
            >
              <div className="px-6 py-6 space-y-4">
                {[
                  { id: 'name', label: 'Name', type: 'text' },
                  { id: 'producer', label: 'Producer', type: 'text' },
                  { id: 'grapes', label: 'Grapes', type: 'text' },
                  { id: 'country', label: 'Country', type: 'text' },
                  { id: 'region', label: 'Region', type: 'text' },
                  { id: 'year', label: 'Year', type: 'number' },
                  { id: 'price', label: 'Price', type: 'number' },
                  { id: 'quantity', label: 'Quantity', type: 'number' }
                ].map(field => (
                  <div key={field.id} className="flex items-center gap-4">
                    <label 
                      htmlFor={field.id}
                      className="text-sm font-medium text-gray-700 w-24 flex-shrink-0"
                    >
                      {field.label}
                    </label>
                    {field.type === 'number' ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Select
                          value={(filters[field.id as keyof Wine] as NumericFilter)?.operator || '='}
                          onValueChange={(value) => {
                            const currentFilter = filters[field.id as keyof Wine] as NumericFilter;
                            handleFilterChange(field.id as keyof Wine, {
                              operator: value as '<' | '=' | '>',
                              value: currentFilter?.value || ''
                            });
                          }}
                        >
                          <SelectTrigger className="w-[60px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="<">&lt;</SelectItem>
                            <SelectItem value="=">=</SelectItem>
                            <SelectItem value=">">&gt;</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          id={field.id}
                          type="number"
                          value={(filters[field.id as keyof Wine] as NumericFilter)?.value || ''}
                          onChange={(e) => {
                            const currentFilter = filters[field.id as keyof Wine] as NumericFilter;
                            handleFilterChange(field.id as keyof Wine, {
                              operator: currentFilter?.operator || '=',
                              value: e.target.value
                            });
                          }}
                          className="flex-1"
                          placeholder="Enter value"
                        />
                      </div>
                    ) : (
                      <Input
                        id={field.id}
                        type="text"
                        value={(filters[field.id as keyof Wine] as string) || ''}
                        onChange={(e) => handleFilterChange(field.id as keyof Wine, e.target.value)}
                        className="flex-1"
                        placeholder={`Filter by ${field.label.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </main>
      {showScrollToTop && (
        <Button
          onClick={handleScrollToTop}
          className="fixed bottom-6 right-6 h-10 w-10 rounded-full bg-green-500 hover:bg-green-600 p-0 shadow-lg z-[100] flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6 text-white" />
        </Button>
      )}
    </div>
  );
}