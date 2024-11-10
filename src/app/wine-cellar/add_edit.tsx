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
    <div className={`${
      /Android/i.test(navigator.userAgent)
        ? "absolute top-0 left-0 right-0 bottom-0 bg-background z-50"
        : /iPhone|iPad|iPod/i.test(navigator.userAgent)
          ? "fixed inset-0 top-0 bg-background z-50"
          : "fixed inset-0 flex flex-col bg-background"
      }`}
      style={{
        ...(/Android/i.test(navigator.userAgent)
          ? {
              top: '0',
              height: '100%'
            }
          : !(/iPhone|iPad|iPod/i.test(navigator.userAgent))
            ? {
                top: '7rem',
                height: 'calc(100% - 7rem)'
              }
            : {}
        )
      }}
    >
      {/* Form Layout Container */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-none bg-background border-b px-4 py-3 z-[60] flex items-center justify-between">
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

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto">
          <div className={`${
            /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
              ? "p-4 pb-48 ios-form-scroll"
              : "w-full max-w-2xl mx-auto px-6 lg:px-8 py-6"
          }`}>
            <form 
              onSubmit={handleSubmit} 
              className="flex flex-col w-full space-y-4"
            >
              {/* Form Fields */}
              <div className="space-y-4 flex-1 overflow-y-auto">
                {[
                  { id: 'name', label: 'Name', value: form.name },
                  { id: 'producer', label: 'Producer', value: form.producer || '' },
                  { id: 'grapes', label: 'Grapes', value: form.grapes || '' },
                  { id: 'country', label: 'Country', value: form.country || '' },
                  { id: 'region', label: 'Region', value: form.region || '' },
                  { id: 'year', label: 'Year', value: form.year || '', type: 'number' },
                  { id: 'price', label: 'Price', value: form.price || '', type: 'number' },
                  { id: 'bottle_size', label: 'Bottle Size (L)', value: form.bottle_size || '', type: 'number' },
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white w-full"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : (isAdding ? 'Add Wine' : 'Save Changes')}
              </Button>
            </form>
          </div>
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