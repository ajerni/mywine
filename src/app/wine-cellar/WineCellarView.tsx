'use client';

import { useState } from 'react';

import { useWines, type WineInput } from './WineProvider';
import { useWineFilters } from './hooks/useWineFilters';
import { useWineTableLayout } from './hooks/useWineTableLayout';
import { WineToolbar } from './components/WineToolbar';
import { WineCardList } from './components/WineCardList';
import { WineTable } from './components/WineTable';
import { WineFilterSheet } from './components/WineFilterSheet';
import { WineListSkeleton } from './components/WineListSkeleton';
import {
  WineEmptyState,
  WineErrorState,
  WineNoResultsState,
} from './components/WineEmptyState';
import { WineFormDialog } from './components/WineFormDialog';
import { WineDetailsModal } from './WineDetailsModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { ChatWindow } from './ChatWindow';
import type { Wine } from './types';

export default function WineCellarView() {
  const { wines, user, status, error, reload, addWine, updateWine, deleteWine } =
    useWines();
  const filters = useWineFilters(wines);
  const tableLayout = useWineTableLayout();

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [wineBeingEdited, setWineBeingEdited] = useState<Wine | null>(null);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [wineToDelete, setWineToDelete] = useState<Wine | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openAddForm = () => {
    setWineBeingEdited(null);
    setIsFormOpen(true);
  };

  const openEditForm = (wine: Wine) => {
    setWineBeingEdited(wine);
    setIsFormOpen(true);
  };

  const submitForm = (input: WineInput) =>
    wineBeingEdited ? updateWine(wineBeingEdited.id, input) : addWine(input);

  // The details modal holds its own copy of the wine, so keep it pointed at the
  // live record whenever notes or ratings change underneath it.
  const liveSelectedWine = selectedWine
    ? (wines.find((wine) => wine.id === selectedWine.id) ?? null)
    : null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold">Wine Cellar</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {user ? `${user.username}'s collection` : 'Your collection'}
        </p>
      </div>

      {status === 'error' ? (
        <WineErrorState message={error ?? 'Unknown error'} onRetry={reload} />
      ) : (
        <>
          <WineToolbar
            search={filters.search}
            onSearchChange={filters.setSearch}
            filters={filters.filters}
            activeFilterCount={filters.activeFilterCount}
            onOpenFilters={() => setIsFilterSheetOpen(true)}
            onClearFilter={(key) => filters.setFilter(key, '')}
            onResetFilters={filters.resetFilters}
            sort={filters.sort}
            onSortChange={filters.setSort}
            isColumnVisible={tableLayout.isColumnVisible}
            onToggleColumn={tableLayout.toggleColumn}
            onResetColumns={tableLayout.resetLayout}
            onAdd={openAddForm}
            onOpenChat={user?.has_proaccount ? () => setIsChatOpen(true) : undefined}
            totalCount={wines.length}
            visibleCount={filters.visibleWines.length}
          />

          <div className="mt-4">
            {status === 'loading' ? (
              <WineListSkeleton />
            ) : wines.length === 0 ? (
              <WineEmptyState onAdd={openAddForm} />
            ) : filters.visibleWines.length === 0 ? (
              <WineNoResultsState onReset={filters.resetFilters} />
            ) : (
              <>
                <WineCardList wines={filters.visibleWines} onSelect={setSelectedWine} />
                <WineTable
                  wines={filters.visibleWines}
                  columns={tableLayout.visibleColumns}
                  getWidth={tableLayout.getWidth}
                  onResizeColumn={tableLayout.setColumnWidth}
                  sortKey={filters.sort.key}
                  sortDirection={filters.sort.direction}
                  onToggleSort={filters.toggleSort}
                  onSelect={setSelectedWine}
                />
              </>
            )}
          </div>
        </>
      )}

      <WineFilterSheet
        open={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
        filters={filters.filters}
        onFilterChange={filters.setFilter}
        onReset={filters.resetFilters}
        activeFilterCount={filters.activeFilterCount}
        resultCount={filters.visibleWines.length}
      />

      <WineFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        wine={wineBeingEdited}
        onSubmit={submitForm}
      />

      {liveSelectedWine && (
        <WineDetailsModal
          wine={liveSelectedWine}
          onClose={() => setSelectedWine(null)}
          onEdit={(wine) => {
            setSelectedWine(null);
            openEditForm(wine);
          }}
          onDelete={(wine) => {
            setSelectedWine(null);
            setWineToDelete(wine);
          }}
        />
      )}

      {wineToDelete && (
        <DeleteConfirmationModal
          title="Delete wine"
          message={`"${wineToDelete.name}" and its photos will be removed permanently.`}
          onConfirm={async () => {
            await deleteWine(wineToDelete);
            setWineToDelete(null);
          }}
          onCancel={() => setWineToDelete(null)}
        />
      )}

      {user?.has_proaccount && (
        <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  );
}
