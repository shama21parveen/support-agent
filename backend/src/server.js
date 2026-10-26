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

// FRONTEND_URL can hold one or more comma-separated site URLs.
// Trailing slashes and spaces are cleaned up. If it is empty, every origin is allowed.
const allowed = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      const ok = !origin || allowed.length === 0 || allowed.includes(origin) || origin === "http://localhost:5173";
      cb(null, ok);
    },
  })
);
app.use(express.json());

app.get("/", (req, res) => res.json({ name: "Nova API", status: "ok" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));

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