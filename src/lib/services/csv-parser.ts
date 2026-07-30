import { parse } from 'csv-parse/sync';

/** A problem with the user's file rather than with the server. */
export class CsvImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CsvImportError';
  }
}

export interface WineRecord {
  wine_id: number | null;
  wine_name: string;
  producer: string;
  grapes: string;
  country: string;
  region: string;
  year: number | null;
  price: number | null;
  quantity: number;
  bottle_size: number;
  rating: number | null;
  note_text: string | null;
  ai_summary: string | null;
}

export const CSV_COLUMNS = [
  'wine_id',
  'wine_name',
  'producer',
  'grapes',
  'country',
  'region',
  'year',
  'price',
  'quantity',
  'bottle_size',
  'rating',
  'note_text',
  'ai_summary',
] as const;

type Column = (typeof CSV_COLUMNS)[number];

/**
 * Spreadsheet editors rename and reorder headers freely, so accept the common
 * variants rather than forcing the user to match the export byte for byte.
 */
const HEADER_ALIASES: Record<string, Column> = {
  id: 'wine_id',
  wine_id: 'wine_id',
  name: 'wine_name',
  wine: 'wine_name',
  wine_name: 'wine_name',
  producer: 'producer',
  winery: 'producer',
  grape: 'grapes',
  grapes: 'grapes',
  varietal: 'grapes',
  country: 'country',
  region: 'region',
  appellation: 'region',
  year: 'year',
  vintage: 'year',
  price: 'price',
  quantity: 'quantity',
  qty: 'quantity',
  bottles: 'quantity',
  bottle_size: 'bottle_size',
  size: 'bottle_size',
  volume: 'bottle_size',
  rating: 'rating',
  stars: 'rating',
  note: 'note_text',
  notes: 'note_text',
  note_text: 'note_text',
  summary: 'ai_summary',
  ai_summary: 'ai_summary',
};

const DEFAULT_BOTTLE_SIZE = 0.75;

function normaliseHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Excel writes `;` in locales where `,` is the decimal separator, and Numbers
 * can emit tabs. Whichever candidate appears most in the header line wins.
 */
function detectDelimiter(text: string) {
  const lineBreak = text.search(/\r?\n/);
  const header = lineBreak === -1 ? text : text.slice(0, lineBreak);

  let best = ',';
  let bestCount = 0;
  for (const candidate of [',', ';', '\t']) {
    const count = header.split(candidate).length - 1;
    if (count > bestCount) {
      best = candidate;
      bestCount = count;
    }
  }
  return best;
}

function parseNumber(raw: string, decimalComma: boolean, label: string, row: number) {
  if (!raw) return null;

  // Strip currency symbols and stray spaces before deciding on separators.
  let text = raw.replace(/[^\d,.\-]/g, '');
  text = decimalComma ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '');

  const value = Number(text);
  if (text === '' || !Number.isFinite(value)) {
    throw new CsvImportError(`Row ${row}: "${raw}" is not a valid ${label}.`);
  }
  return value;
}

export function parseAndValidateCSV(csvText: string): WineRecord[] {
  if (!csvText.trim()) {
    throw new CsvImportError('The file is empty.');
  }

  const delimiter = detectDelimiter(csvText);
  const decimalComma = delimiter === ';';
  const headers: string[] = [];

  const read = (quoted: boolean) => {
    headers.length = 0;
    return parse(csvText, {
      bom: true,
      delimiter,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
      quote: quoted ? '"' : false,
      columns: (header: string[]) =>
        header.map((name) => {
          const column = HEADER_ALIASES[normaliseHeader(name)] ?? normaliseHeader(name);
          headers.push(column);
          return column;
        }),
    }) as Record<string, string | undefined>[];
  };

  let rows: Record<string, string | undefined>[];
  try {
    rows = read(true);
  } catch {
    // A stray " in a wine name is far more likely than a deliberately quoted
    // field, so fall back to reading quotes as ordinary characters.
    try {
      rows = read(false);
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'unknown error';
      throw new CsvImportError(`The file could not be read as CSV: ${detail}`);
    }
  }

  if (!headers.includes('wine_name')) {
    throw new CsvImportError(
      'The file needs a "wine_name" column. Export your cellar to get a template with the right headers.',
    );
  }

  const records: WineRecord[] = [];

  rows.forEach((row, index) => {
    const line = index + 2;
    const text = (column: Column) => row[column]?.trim() ?? '';

    // Spreadsheets leave behind rows of empty cells; those are not wines.
    if (CSV_COLUMNS.every((column) => text(column) === '')) return;

    const name = text('wine_name');
    if (!name) {
      throw new CsvImportError(`Row ${line}: the wine needs a name.`);
    }

    const wineId = parseNumber(text('wine_id'), false, 'wine id', line);
    const year = parseNumber(text('year'), decimalComma, 'year', line);
    const price = parseNumber(text('price'), decimalComma, 'price', line);
    const quantity = parseNumber(text('quantity'), decimalComma, 'quantity', line);
    const bottleSize = parseNumber(text('bottle_size'), decimalComma, 'bottle size', line);
    const rating = parseNumber(text('rating'), decimalComma, 'rating', line);

    records.push({
      wine_id: wineId === null ? null : Math.trunc(wineId),
      wine_name: name,
      producer: text('producer'),
      grapes: text('grapes'),
      country: text('country'),
      region: text('region'),
      year: year === null ? null : Math.trunc(year),
      price,
      quantity: quantity === null ? 0 : Math.max(0, Math.trunc(quantity)),
      bottle_size: bottleSize === null || bottleSize <= 0 ? DEFAULT_BOTTLE_SIZE : bottleSize,
      // Anything outside 1–5 is dropped rather than rejected, so one stray
      // value cannot block the whole import.
      rating: rating !== null && rating >= 1 && rating <= 5 ? Math.trunc(rating) : null,
      note_text: text('note_text') || null,
      ai_summary: text('ai_summary') || null,
    });
  });

  return records;
}
