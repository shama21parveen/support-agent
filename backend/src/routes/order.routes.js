import { Router } from "express";
import Order from "../models/Order.js";
import { verifyCancel } from "../services/cancelToken.js";

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

// POST /api/orders/cancel  { token }  (token comes from Nova's confirmation card)
router.post("/cancel", async (req, res) => {
  try {
    const orderId = verifyCancel(req.body?.token);
    if (!orderId) return res.status(400).json({ error: "This confirmation expired. Ask Nova to cancel again." });

    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status === "Cancelled") return res.status(409).json({ error: "This order is already cancelled" });
    if (order.status !== "Packed") return res.status(409).json({ error: `Order is ${order.status} and can't be cancelled now` });

    order.status = "Cancelled";
    order.eta = "Cancelled";
    await order.save();
    console.log("Order cancelled:", orderId);
    res.json({ orderId, status: "Cancelled", refundEta: "3-5 working days" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not cancel the order" });
  }
});

export default router;
