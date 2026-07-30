'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BOTTLE_SIZES } from '../bottle_sizes';
import type { WineInput } from '../WineProvider';
import type { Wine } from '../types';

const currentYear = new Date().getFullYear();

const optionalText = z
  .string()
  .trim()
  .max(255, 'Keep this under 255 characters')
  .optional();

// Number inputs report their value as a string, so validate the string and
// convert on submit — z.coerce here would erase the form's input types.
const numericField = (message: string, isValid: (value: number) => boolean) =>
  z
    .string()
    .trim()
    .refine((raw) => raw === '' || (raw !== '' && isValid(Number(raw))), message);

const wineSchema = z.object({
  name: z.string().trim().min(1, 'A name is required').max(255, 'Name is too long'),
  producer: optionalText,
  grapes: optionalText,
  country: optionalText,
  region: optionalText,
  year: numericField(
    `Enter a year between 1800 and ${currentYear + 5}`,
    (value) => Number.isInteger(value) && value >= 1800 && value <= currentYear + 5,
  ),
  price: numericField('Enter a price of 0 or more', (value) => value >= 0),
  quantity: numericField(
    'Enter a whole number of 0 or more',
    (value) => Number.isInteger(value) && value >= 0,
  ),
  bottle_size: numericField('Choose a bottle size', (value) => value > 0),
});

type WineFormValues = z.input<typeof wineSchema>;

const EMPTY: WineFormValues = {
  name: '',
  producer: '',
  grapes: '',
  country: '',
  region: '',
  year: '',
  price: '',
  quantity: '',
  bottle_size: '0.75',
};

function toFormValues(wine: Wine | null): WineFormValues {
  if (!wine) return EMPTY;
  return {
    name: wine.name,
    producer: wine.producer ?? '',
    grapes: wine.grapes ?? '',
    country: wine.country ?? '',
    region: wine.region ?? '',
    year: wine.year?.toString() ?? '',
    price: wine.price?.toString() ?? '',
    quantity: (wine.quantity ?? 0).toString(),
    bottle_size: wine.bottle_size?.toString() ?? '',
  };
}

const TEXT_FIELDS = [
  { name: 'name', label: 'Name' },
  { name: 'producer', label: 'Producer' },
  { name: 'grapes', label: 'Grapes' },
  { name: 'country', label: 'Country' },
  { name: 'region', label: 'Region' },
] as const;

interface WineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wine: Wine | null;
  onSubmit: (input: WineInput) => Promise<boolean>;
}

export function WineFormDialog({
  open,
  onOpenChange,
  wine,
  onSubmit,
}: WineFormDialogProps) {
  const form = useForm<WineFormValues>({
    resolver: zodResolver(wineSchema),
    defaultValues: toFormValues(wine),
  });

  useEffect(() => {
    if (open) form.reset(toFormValues(wine));
  }, [open, wine, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    const optional = (raw: string) => (raw === '' ? undefined : Number(raw));
    const succeeded = await onSubmit({
      name: values.name.trim(),
      producer: values.producer?.trim() || undefined,
      grapes: values.grapes?.trim() || undefined,
      country: values.country?.trim() || undefined,
      region: values.region?.trim() || undefined,
      year: optional(values.year),
      price: optional(values.price),
      quantity: values.quantity === '' ? 0 : Number(values.quantity),
      bottle_size: optional(values.bottle_size),
    });
    if (succeeded) onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="bg-background shrink-0 border-b px-6 py-4 text-left">
          <DialogTitle>{wine ? 'Edit wine' : 'Add a wine'}</DialogTitle>
          <DialogDescription>
            {wine
              ? 'Update the details of this bottle.'
              : 'Only a name is required — everything else can come later.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 py-4">
              {TEXT_FIELDS.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name}
                  render={({ field: controlled }) => (
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        <Input
                          {...controlled}
                          value={controlled.value ?? ''}
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          type="number"
                          inputMode="numeric"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          type="number"
                          inputMode="decimal"
                          step="0.05"
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bottle_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bottle size</FormLabel>
                      <Select
                        value={field.value ? String(field.value) : undefined}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BOTTLE_SIZES.map((size) => (
                            <SelectItem
                              key={size.value}
                              value={String(size.value)}
                            >
                              {size.text}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="bg-background shrink-0 border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Saving…'
                  : wine
                    ? 'Save changes'
                    : 'Add wine'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
