import { Product, PortalProduct } from '../types';

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL;
const STORE_SLUG = import.meta.env.VITE_STORE_SLUG;
const INGEST_SECRET = import.meta.env.VITE_INGEST_SECRET;
const STORE_ID = import.meta.env.VITE_STORE_ID;

export async function fetchProducts(): Promise<Product[]> {
    console.log('Fetching from:', `${PORTAL_URL}/api/public/products?store=${STORE_SLUG}`);
    const res = await fetch(`${PORTAL_URL}/api/public/products?store=${STORE_SLUG}`);
    console.log('Response status:', res.status);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data: PortalProduct[] = await res.json();
    console.log('Products received:', data);
    return data.map((p) => {
        // Build gallery: prefer images array, fall back to single img
        const gallery: string[] = p.images?.length
            ? p.images
            : p.img
                ? [p.img]
                : ['https://placehold.co/800x1200/1A0A00/FFE600?text=DHANAK'];

        return {
            id: p.id,
            name: p.name,
            price: p.price,                          // keep as number — types.ts now uses number
            img: gallery[0],                         // main image is always first in gallery
            images: gallery,
            gallery,
            color: categoryColor(p.category),
            tag: p.category || 'Heritage',
            category: p.category ?? 'Accessories',
            description: p.description || '',
            materials: p.materials || '',
            sku: p.sku,
            stock: p.stock,
        };
    });
}

function categoryColor(category?: string): string {
    switch (category?.toLowerCase()) {
        case 'earrings': return 'bg-brand-magenta';
        case 'necklaces': return 'bg-brand-turquoise';
        case 'bangles': return 'bg-brand-yellow';
        default: return 'bg-brand-coral';
    }
}

async function sendToPortal(type: string, data: object) {
    try {
        await fetch(`${PORTAL_URL}/api/ingest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-ingest-secret': INGEST_SECRET,
            },
            body: JSON.stringify({ type, storeId: STORE_ID, data }),
        });
    } catch (err) {
        console.error('Portal ingest failed:', err);
    }
}

export const portal = {
    orderCreated: (orderData: any) => sendToPortal('ORDER_CREATED', orderData),
    pageVisit: (page: string, sessionId?: string) => sendToPortal('PAGE_VISIT', { page, sessionId }),
    customerRegistered: (email: string, name?: string) => sendToPortal('CUSTOMER_REGISTERED', { email, name }),
};