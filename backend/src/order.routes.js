import { Router } from "express";
import Order from "../models/Order.js";

const router = Router();

// POST /api/orders  { name, items: [{ name, qty }] }
router.post("/", async (req, res) => {
  try {
    const { name, items } = req.body;
    if (!name?.trim() || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Name and items are required" });
    }
    const orderId = "ORD" + Math.floor(2000 + Math.random() * 7999);
    const order = await Order.create({
      orderId,
      customerName: name.trim(),
      status: "Packed",
      items: items.map((i) => `${i.name} x${i.qty}`),
      eta: "Arrives in 4 days",
    });
    res.status(201).json({ orderId: order.orderId, eta: order.eta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not place order" });
  }
});

export default router;
