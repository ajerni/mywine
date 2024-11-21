export interface Wine {
  id: number;
  name: string;
  producer?: string;
  grapes?: string;
  country?: string;
  region?: string;
  year?: number;
  price?: number;
  quantity: number;
  user_id?: number;
  note_text?: string;
  ai_summary?: string;
  bottle_size?: number;
  rating?: number;
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