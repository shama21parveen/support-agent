import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import "dotenv/config";
import mongoose from "mongoose";
import KnowledgeDoc from "./models/KnowledgeDoc.js";

const docs = [
  { title: "Refund Policy", content: "Refund requests must be made within 7 days of delivery. Once approved, the money returns to the original payment method in 5-7 working days. COD refunds go to a bank account or UPI. Used items or items damaged by the customer are not refundable." },
  { title: "Return Policy", content: "Products can be returned within 7 days of delivery. They must be unused, in original packaging with tags. Return pickup is free for damaged or wrong items. Innerwear and personal care items cannot be returned." },
  { title: "Shipping Policy", content: "Standard delivery takes 3-5 working days. Express delivery takes 1-2 days for an extra Rs 99. Shipping is free on orders above Rs 499. Remote areas can take up to 7 days." },
  { title: "Payment Methods", content: "We accept UPI, credit cards, debit cards, net banking and Cash on Delivery. COD has an extra charge of Rs 40 and is not available for orders above Rs 5000." },
  { title: "Order Cancellation", content: "Orders can be cancelled before they are Packed. Shipped orders cannot be cancelled, but they can be returned after delivery. Refunds for cancelled orders arrive in 3-5 working days." },
];

await mongoose.connect(process.env.MONGO_URI);
await KnowledgeDoc.deleteMany({});
await KnowledgeDoc.insertMany(docs);
await KnowledgeDoc.syncIndexes();
console.log("Seeded", docs.length, "policy docs");
await mongoose.disconnect();
