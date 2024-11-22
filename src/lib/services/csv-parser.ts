import { parse } from 'csv-parse/sync';
import { z } from 'zod';

// Define strict types for wine records
const WineRecordSchema = z.object({
  wine_id: z.string().optional(),
  wine_name: z.string().min(1, "Wine name is required"),
  producer: z.string().default(""),
  grapes: z.string().default(""),
  country: z.string().default(""),
  region: z.string().default(""),
  year: z.string().transform(val => val ? parseInt(val) : null).optional(),
  price: z.string().transform(val => val ? parseFloat(val) : null).optional(),
  quantity: z.string().transform(val => val ? parseInt(val) : 0).default("0"),
  rating: z.string().transform(val => val ? parseInt(val) : null).optional(),
  bottle_size: z.string().optional(),
  note_text: z.string().optional(),
  ai_summary: z.string().optional(),
});

export type WineRecord = z.infer<typeof WineRecordSchema>;

// Define a type for raw CSV records
interface RawCSVRecord {
  [key: string]: string;
}

export function parseAndValidateCSV(csvText: string) {
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    cast: false,
    delimiter: ',',
    relax_column_count: true,
    quote: '"',
    skip_records_with_error: true,
  }) as RawCSVRecord[];

  // Validate and transform each record
  const validatedRecords = records.map((record: RawCSVRecord, index: number) => {
    try {
      // Convert empty strings to undefined for optional fields
      const cleanedRecord = Object.fromEntries(
        Object.entries(record).map(([key, value]) => [
          key,
          value === '' ? undefined : value
        ])
      );
      
      return WineRecordSchema.parse(cleanedRecord);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid record at row ${index + 2}: ${error.errors[0].message}`);
      }
      throw new Error(`Invalid record at row ${index + 2}: Unknown validation error`);
    }
  });

  return validatedRecords;
} 