export interface Product {
  id: string;
  name: string;
  price: number;        // was string — API returns number
  stock?: number;
  img: string;
  images?: string[];
  gallery?: string[];   // mapped from images in ProductsContext
  color: string;
  tag?: string;
  category: string;
  description: string;
  materials: string;
  sku?: string;
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
  images?: string[];
  description?: string;
  materials?: string;
  sku?: string;
}