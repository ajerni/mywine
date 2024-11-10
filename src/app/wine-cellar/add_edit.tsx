'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from 'lucide-react';
import { Wine } from './types';
import { EmptyNameFieldModal } from './EmptyNameFieldModal';
import { BOTTLE_SIZES } from './bottle_sizes';

interface AddEditFormProps {
  isAdding: boolean;
  wine: Wine | Omit<Wine, 'id'>;
  onSave: (wine: Wine | Omit<Wine, 'id'>) => Promise<void>;
  onClose: () => void;
}

interface FormField {
  id: string;
  label: string;
  value: string | number;
  type?: string;
  min?: number;
  step?: number;
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

  const formFields: FormField[] = [
    { id: 'name', label: 'Name', value: form.name },
    { id: 'producer', label: 'Producer', value: form.producer || '' },
    { id: 'grapes', label: 'Grapes', value: form.grapes || '' },
    { id: 'country', label: 'Country', value: form.country || '' },
    { id: 'region', label: 'Region', value: form.region || '' },
    { id: 'year', label: 'Year', value: form.year || '', type: 'number', step: 1 },
    { id: 'price', label: 'Price', value: form.price || '', type: 'number', step: 0.05 },
    { id: 'quantity', label: 'Quantity', value: form.quantity ?? 0, type: 'number', min: 0, step: 1 }
  ];

  return (
    <div className="fixed inset-x-0 top-[7rem] bottom-[3.5rem] flex flex-col bg-background ios-form-container">
      {/* Header - Updated with iOS-specific class */}
      <div className="flex-none bg-background border-b px-4 py-3 flex items-center justify-between ios-form-header">
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

      {/* Main Form Container - Added iOS-specific padding offset */}
      <div className="flex-1 overflow-y-auto ios-form-scroll">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 ios-form-content ios-form-content-offset">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            {/* Render first 6 fields (up to Year) */}
            {formFields.slice(0, 6).map((field) => (
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
                    step={field.step}
                    min={field.min}
                    onChange={e => {
                      const value = field.type === 'number' 
                        ? (field.id === 'quantity' 
                            ? Math.max(0, parseInt(e.target.value) || 0)
                            : field.id === 'bottle_size'
                              ? Math.max(0, Number(e.target.value) || 0)
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

            {/* Bottle Size Select */}
            <div className="flex items-center gap-4">
              <label 
                htmlFor="bottle_size" 
                className="text-sm font-medium text-gray-700 w-32 flex-shrink-0"
              >
                Bottle Size
              </label>
              <div className="flex-1">
                <Select
                  value={form.bottle_size ? 
                    BOTTLE_SIZES.find(size => 
                      Math.abs(size.value - form.bottle_size!) < 0.001
                    )?.value.toString() : undefined
                  }
                  onValueChange={(value) => {
                    setForm({ ...form, bottle_size: Number(value) });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bottle size" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOTTLE_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value.toString()}>
                        {size.text}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Render remaining fields (Price and Quantity) */}
            {formFields.slice(6).map((field) => (
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
                    step={field.step}
                    min={field.min}
                    onChange={e => {
                      const value = field.type === 'number' 
                        ? (field.id === 'quantity' 
                            ? Math.max(0, parseInt(e.target.value) || 0)
                            : field.id === 'bottle_size'
                              ? Math.max(0, Number(e.target.value) || 0)
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