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

// Raw shape coming from the portal API
export interface PortalProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  img?: string;
  sku?: string;
}