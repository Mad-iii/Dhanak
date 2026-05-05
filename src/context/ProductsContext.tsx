import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '../types';

interface ProductsContextType {
    products: Product[];
    loading: boolean;
}

const ProductsContext = createContext<ProductsContextType>({ products: [], loading: true });

export const ProductsProvider = ({ children }: { children: React.ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("https://owner-portal-ten.vercel.app/api/public/products?store=dhanak")
            .then(r => r.json())
            .then(data => {
                const normalized: Product[] = data.map((p: any) => ({
                    ...p,
                    price: Number(p.price),
                    img: p.images?.[0] || p.img || "",
                    gallery: p.images?.length ? p.images : (p.img ? [p.img] : []),
                    tag: p.category || "Heritage",
                    color: "bg-brand-magenta",
                    description: p.description || "",
                    materials: p.materials || "",
                }));
                setProducts(normalized);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <ProductsContext.Provider value={{ products, loading }}>
            {children}
        </ProductsContext.Provider>
    );
};

export const useProducts = () => useContext(ProductsContext);