const PORTAL_URL = process.env.PORTAL_URL!;
const INGEST_SECRET = process.env.INGEST_SECRET!;
const STORE_ID = process.env.STORE_ID!;

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