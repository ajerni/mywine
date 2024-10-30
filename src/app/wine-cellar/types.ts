export interface Wine {
  id: number;
  name: string;
  producer: string | null;
  grapes: string | null;
  country: string | null;
  region: string | null;
  year: number | null;
  price: number | null;
  quantity: number;
  user_id: number | null;
  note_text: string | null;
  notes?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: Date;
}

export interface NumericFilter {
  value: string;
  operator: '<' | '=' | '>';
}
