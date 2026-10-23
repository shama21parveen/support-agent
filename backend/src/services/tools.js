import KnowledgeDoc from "../models/KnowledgeDoc.js";
import Order from "../models/Order.js";
import Ticket from "../models/Ticket.js";

export const functionDeclarations = [
  {
    name: "get_order_status",
    description: "Order ID (jaise ORD1001) se order ka status, items aur delivery time batata hai.",
    parameters: {
      type: "OBJECT",
      properties: {
        orderId: { type: "STRING", description: "Order ID, jaise ORD1001" },
      },
      required: ["orderId"],
    },
  },
  {
    name: "create_ticket",
    description: "Jab customer ki problem tum solve nahi kar sakte ya wo human agent maange, tab support ticket banata hai.",
    parameters: {
      type: "OBJECT",
      properties: {
        issue: { type: "STRING", description: "Problem ka short description" },
        orderId: { type: "STRING", description: "Related order ID (optional)" },
      },
      required: ["issue"],
    },
  },
  {
    name: "search_policy",
    description:
      "Company ki policy dhundta hai: refund, return, shipping, payment, cancellation. Jab customer policy ya rules ke baare mein pooche tab use karo.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: { type: "STRING", description: "Search keywords, jaise 'refund' ya 'shipping charges'" },
      },
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