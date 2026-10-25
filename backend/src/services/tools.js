import KnowledgeDoc from "../models/KnowledgeDoc.js";
import Order from "../models/Order.js";
import Ticket from "../models/Ticket.js";
import { signCancel } from "./cancelToken.js";

export const functionDeclarations = [
  {
    name: "get_order_status",
    description: "Gets the status, items, delivery estimate and whether it can still be cancelled for an order ID (for example ORD1001).",
    parameters: {
      type: "OBJECT",
      properties: { orderId: { type: "STRING", description: "Order ID, for example ORD1001" } },
      required: ["orderId"],
    },
  },
  {
    name: "cancel_order",
    description:
      "Starts the cancellation of an order. It NEVER cancels immediately: it shows the customer a confirmation card and the customer must press the confirm button. Use it when the customer wants to cancel an order.",
    parameters: {
      type: "OBJECT",
      properties: { orderId: { type: "STRING", description: "Order ID to cancel, for example ORD1003" } },
      required: ["orderId"],
    },
  },
  {
    name: "create_ticket",
    description: "Creates a support ticket when you cannot solve the problem or the customer asks for a human agent.",
    parameters: {
      type: "OBJECT",
      properties: {
        issue: { type: "STRING", description: "Short description of the problem" },
        orderId: { type: "STRING", description: "Related order ID (optional)" },
      },
      required: ["issue"],
    },
  },
  {
    name: "search_policy",
    description: "Searches company policies: refund, return, shipping, payment, cancellation. Use it whenever the customer asks about rules or policies.",
    parameters: {
      type: "OBJECT",
      properties: { query: { type: "STRING", description: "Search keywords, for example 'refund' or 'shipping charges'" } },
      required: ["query"],
    },
  },
];

export async function runTool(name, args) {
  if (name === "get_order_status") {
    const id = String(args.orderId || "").trim().toUpperCase();
    const order = await Order.findOne({ orderId: id }).lean();
    if (!order) return { found: false, message: `Order ${id} not found` };
    return {
      found: true,
      orderId: order.orderId,
      status: order.status,
      items: order.items,
      eta: order.eta,
      canStillBeCancelled: order.status === "Packed",
    };
  }

  if (name === "cancel_order") {
    const id = String(args.orderId || "").trim().toUpperCase();
    const order = await Order.findOne({ orderId: id }).lean();
    if (!order) return { ok: false, reason: `Order ${id} not found` };
    if (order.status === "Cancelled") return { ok: false, reason: "This order is already cancelled" };
    if (order.status !== "Packed") {
      return { ok: false, reason: `This order is ${order.status}, so it can no longer be cancelled. After delivery the customer can request a return.` };
    }
    return {
      ok: true,
      awaitingCustomerConfirmation: true,
      orderId: id,
      items: order.items,
      instruction: "A confirmation card is now visible to the customer. Ask them to review it and press the confirm button. Do NOT say the order is cancelled yet.",
      _action: { type: "confirm_cancel", orderId: id, items: order.items, token: signCancel(id) },
    };
  }

  if (name === "create_ticket") {
    const ticketId = "TKT" + Math.floor(1000 + Math.random() * 9000);
    await Ticket.create({ ticketId, issue: args.issue, orderId: args.orderId });
    return { ticketId, status: "Open" };
  }

  if (name === "search_policy") {
    const docs = await KnowledgeDoc.find(
      { $text: { $search: String(args.query || "") } },
      { score: { $meta: "textScore" }, title: 1, content: 1 }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(2)
      .lean();
    if (docs.length === 0) return { found: false, message: "No matching policy found" };
    return { found: true, docs: docs.map((d) => ({ title: d.title, content: d.content })) };
  }

  return { error: "Unknown tool" };
}
