export interface Wine {
  id: number;
  name: string;
  producer: string;
  grapes: string;
  country: string;
  region: string;
  year: number | null;
  price: number | null;
  quantity: number;
  user_id: number | null;
}
