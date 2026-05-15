export default async function handler(req, res) {
    const { storeId, productId, customerEmail } = req.query;

    const ownerPortalUrl = process.env.OWNER_PORTAL_URL ?? "https://owner-portal-ten.vercel.app";
    const secret = process.env.DHANAK_API_SECRET ?? "";
    const storeIdParam = process.env.STORE_ID ?? storeId;

    try {
        const upstream = await fetch(
            `${ownerPortalUrl}/api/reviews/eligible?storeId=${storeIdParam}&productId=${encodeURIComponent(productId)}&customerEmail=${encodeURIComponent(customerEmail)}`,
            { headers: { "x-api-secret": secret } }
        );
        const data = await upstream.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}