export interface Product {
  id: string;
  name: string;
  price: string;
  img: string;
  color: string;
  tag?: string;
  category: string;
  description: string;
  materials: string;
  gallery?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}
