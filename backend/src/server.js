import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import chatRoutes from "./routes/chat.routes.js";
import orderRoutes from "./routes/order.routes.js";

const app = express();
app.set("trust proxy", 1); // Render ke proxy ke peeche sahi IP milne ke liye

// Production mein sirf aapki website allow hogi. Local mein FRONTEND_URL nahi hota, toh sab allow.
const origins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((s) => s.trim())
  : true;
app.use(cors({ origin: origins }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please slow down." },
  })
);

app.use("/api/chat", chatRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});