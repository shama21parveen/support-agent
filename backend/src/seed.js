import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import "dotenv/config";
import mongoose from "mongoose";
import Order from "./models/Order.js";

const orders = [
  { orderId: "ORD1001", customerName: "Aman", status: "Shipped", items: ["Blue Headphones"], eta: "2 din mein" },
  { orderId: "ORD1002", customerName: "Riya", status: "Out for delivery", items: ["Running Shoes"], eta: "Aaj shaam tak" },
  { orderId: "ORD1003", customerName: "Sana", status: "Packed", items: ["Phone Case", "Charger"], eta: "4 din mein" },
  { orderId: "ORD1004", customerName: "Karan", status: "Delivered", items: ["Backpack"], eta: "Delivered" },
];

await mongoose.connect(process.env.MONGO_URI);
await Order.deleteMany({});
await Order.insertMany(orders);
console.log("Seeded", orders.length, "orders");
await mongoose.disconnect();