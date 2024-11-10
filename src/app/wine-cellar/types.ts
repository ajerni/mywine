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
  ai_summary: string | null;
  bottle_size: number | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: Date;
  has_proaccount: boolean;
}

export interface NumericFilter {
  value: string;
  operator: '<' | '=' | '>';
}