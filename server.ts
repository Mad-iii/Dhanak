import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Portal integration
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

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  app.use('/Img', express.static(path.join(__dirname, 'Img')));

  // Track page visits
  app.use((req, res, next) => {
    if (!req.path.startsWith("/api")) {
      sendToPortal("PAGE_VISIT", {
        page: req.path,
        sessionId: req.headers["x-session-id"] as string ?? undefined,
      });
    }
    next();
  });

  app.post("/api/payment/init", async (req, res) => {
    try {
      const { amount, currency = "PKR", customerName, customerEmail, items } = req.body;
      const secretKey = process.env.SAFEPAY_SECRET_KEY || "sec_c80a2be3-bcd1-4f8c-ba74-d763fb9285dc";
      const merchantCode = "sec_c80a2be3-bcd1-4f8c-ba74-d763fb9285dc";

      console.log(`[SAFEPAY] Initializing payment: ${amount} ${currency}`);

      const response = await fetch("https://sandbox.api.getsafepay.com/order/v1/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: merchantCode,
          amount: parseFloat(amount),
          currency: currency
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("[SAFEPAY] Init Failed:", data);
        return res.status(response.status).json(data);
      }

      const token = data.data?.token;
      if (!token) throw new Error("No token received from Safepay");

      const checkoutUrl = `https://sandbox.getsafepay.com/checkout/pay?tracker=${token}&amount=${amount}&currency=${currency}&merchant_code=${merchantCode}&source=custom`;

      // Send order to portal
      await sendToPortal("ORDER_CREATED", {
        orderNumber: `DHANAK-${token}`,
        total: parseFloat(amount),
        currency,
        customerName: customerName ?? undefined,
        customerEmail: customerEmail ?? undefined,
        items: items ?? [],
      });

      res.json({ token, checkoutUrl, success: true });
    } catch (error: any) {
      console.error("Safepay Init Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }
  app.get("/api/reviews/eligible", async (req, res) => {
    const { storeId, productId, customerEmail } = req.query as Record<string, string>;
    if (!storeId || !productId || !customerEmail) {
      return res.status(400).json({ error: "Missing params" });
    }

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
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Submit review — proxies from frontend to Owner-portal with the server secret
  app.post("/api/reviews", async (req, res) => {
    const ownerPortalUrl = process.env.OWNER_PORTAL_URL ?? "https://owner-portal-ten.vercel.app";
    const secret = process.env.DHANAK_API_SECRET ?? "";
    const storeId = process.env.STORE_ID;

    if (!storeId) {
      return res.status(500).json({ error: "STORE_ID env var not set" });
    }

    const body = { ...req.body, storeId };

    try {
      const upstream = await fetch(`${ownerPortalUrl}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": secret,
        },
        body: JSON.stringify(body),
      });
      const data = await upstream.json();
      res.status(upstream.status).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();