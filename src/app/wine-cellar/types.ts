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
}

export interface NumericFilter {
  value: string;
  operator: '<' | '=' | '>';
}
