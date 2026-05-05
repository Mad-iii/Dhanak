import { Product, PortalProduct } from '../types';

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL;
const STORE_SLUG = import.meta.env.VITE_STORE_SLUG;
const INGEST_SECRET = import.meta.env.VITE_INGEST_SECRET;  // ← fixed
const STORE_ID = import.meta.env.VITE_STORE_ID;            // ← fixed

export async function fetchProducts(): Promise<Product[]> {
    const res = await fetch(`${PORTAL_URL}/api/public/products?store=${STORE_SLUG}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    const data: PortalProduct[] = await res.json();
    return data.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price.toLocaleString('en-PK'),
        img: p.img ?? 'https://placehold.co/800x1200/1A0A00/FFE600?text=DHANAK',
        color: categoryColor(p.category),
        category: p.category ?? 'Accessories',
        description: '',
        materials: '',
        gallery: p.img ? [p.img] : ['https://placehold.co/800x1200/1A0A00/FFE600?text=DHANAK'],
    }));
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
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-ingest-secret": INGEST_SECRET,
            },
            body: JSON.stringify({ type, storeId: STORE_ID, data }),
        });
    } catch (err) {
        console.error("Portal ingest failed:", err);
    }
}

export const portal = {
    orderCreated: (orderData: any) => sendToPortal("ORDER_CREATED", orderData),
    pageVisit: (page: string, sessionId?: string) => sendToPortal("PAGE_VISIT", { page, sessionId }),
    customerRegistered: (email: string, name?: string) => sendToPortal("CUSTOMER_REGISTERED", { email, name }),
};