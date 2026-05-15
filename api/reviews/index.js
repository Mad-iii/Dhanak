export default async function handler(req, res) {
    const ownerPortalUrl = process.env.OWNER_PORTAL_URL ?? "https://owner-portal-ten.vercel.app";
    const secret = process.env.DHANAK_API_SECRET ?? "";
    const storeId = process.env.STORE_ID;

    const body = { ...req.body, storeId };

    try {
        const upstream = await fetch(`${ownerPortalUrl}/api/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-secret": secret },
            body: JSON.stringify(body),
        });
        const data = await upstream.json();
        res.status(upstream.status).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}