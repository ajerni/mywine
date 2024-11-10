'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from 'lucide-react';
import { Wine } from './types';
import { EmptyNameFieldModal } from './EmptyNameFieldModal';

interface AddEditFormProps {
  isAdding: boolean;
  wine: Wine | Omit<Wine, 'id'>;
  onSave: (wine: Wine | Omit<Wine, 'id'>) => Promise<void>;
  onClose: () => void;
}

export default function AddEditForm({ isAdding, wine, onSave, onClose }: AddEditFormProps) {
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
    <div className="fixed inset-x-0 top-[7rem] bottom-[3.5rem] flex flex-col bg-background">
      {/* Header */}
      <div className="flex-none bg-background border-b px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {isAdding ? "Add Wine" : "Edit Wine"}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Form Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            {/* Form Fields */}
            {[
              { id: 'name', label: 'Name', value: form.name },
              { id: 'producer', label: 'Producer', value: form.producer || '' },
              { id: 'grapes', label: 'Grapes', value: form.grapes || '' },
              { id: 'country', label: 'Country', value: form.country || '' },
              { id: 'region', label: 'Region', value: form.region || '' },
              { id: 'year', label: 'Year', value: form.year || '', type: 'number' },
              { id: 'price', label: 'Price', value: form.price || '', type: 'number' },
              { id: 'bottle_size', label: 'Bottle Size (L)', value: form.bottle_size || '', type: 'number' },
              { id: 'quantity', label: 'Quantity', value: form.quantity ?? 0, type: 'number', min: 0 }
            ].map((field, index) => (
              <div 
                key={field.id} 
                className="flex items-center gap-4"
              >
                <label 
                  htmlFor={field.id} 
                  className="text-sm font-medium text-gray-700 w-32 flex-shrink-0"
                >
                  {field.label}
                </label>
                <div className="flex-1">
                  <Input
                    id={field.id}
                    type={field.type || 'text'}
                    value={field.value}
                    onChange={e => {
                      const value = field.type === 'number' 
                        ? (field.id === 'quantity' 
                            ? Math.max(0, parseInt(e.target.value) || 0)
                            : (e.target.value ? Number(e.target.value) : null))
                        : e.target.value;
                      setForm({ ...form, [field.id]: value });
                    }}
                    placeholder={field.label}
                    className="w-full"
                  />
                </div>
              </div>
            ))}

            {/* Submit Button */}
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white w-full h-11 mt-2"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : (isAdding ? 'Add Wine' : 'Save Changes')}
            </Button>
          </form>
        </div>
      </div>

      {showEmptyNameModal && (
        <EmptyNameFieldModal
          onClose={() => setShowEmptyNameModal(false)}
        />
      )}
    </div>
  );
} 