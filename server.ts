import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Static serving for the Img directory at the root
  app.use('/Img', express.static(path.join(__dirname, 'Img')));

  // API Routes
  app.post("/api/payment/init", async (req, res) => {
    try {
      const { amount, currency = "PKR" } = req.body;
      const secretKey = process.env.SAFEPAY_SECRET_KEY || "sec_c80a2be3-bcd1-4f8c-ba74-d763fb9285dc";
      const merchantCode = "sec_c80a2be3-bcd1-4f8c-ba74-d763fb9285dc"; // Usually the public/secret key or a separate code

      console.log(`[SAFEPAY] Initializing payment: ${amount} ${currency}`);

      const response = await fetch("https://sandbox.api.getsafepay.com/order/v1/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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

      // Safepay returns { status: { ... }, data: { token: '...' } }
      const token = data.data?.token;

      if (!token) {
        throw new Error("No token received from Safepay");
      }

      const checkoutUrl = `https://sandbox.getsafepay.com/checkout/pay?tracker=${token}&amount=${amount}&currency=${currency}&merchant_code=${merchantCode}&source=custom`;

      res.json({ 
        token, 
        checkoutUrl,
        success: true 
      });
    } catch (error: any) {
      console.error("Safepay Init Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
