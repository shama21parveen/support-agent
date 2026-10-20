import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import "dotenv/config";
import mongoose from "mongoose";
import KnowledgeDoc from "./models/KnowledgeDoc.js";

const docs = [
  {
    title: "Refund Policy",
    content:
      "Refund request delivery ke 7 din ke andar karni hoti hai. Refund approve hone ke baad paisa 5-7 working days mein original payment method mein wapas aata hai. COD orders ka refund bank account ya UPI mein hota hai. Used ya damaged-by-customer items ka refund nahi hota.",
  },
  {
    title: "Return Policy",
    content:
      "Product delivery ke 7 din ke andar return kar sakte hain. Product original packaging mein, unused aur tags ke saath hona chahiye. Damaged ya galat product aane par return pickup free hai. Innerwear aur personal care items return nahi hote.",
  },
  {
    title: "Shipping Policy",
    content:
      "Standard delivery 3-5 working days mein hoti hai. Express delivery 1-2 din mein hoti hai aur uska extra charge Rs 99 hai. Rs 499 se upar ke orders par shipping free hai. Remote areas mein delivery 7 din tak lag sakti hai.",
  },
  {
    title: "Payment Methods",
    content:
      "Hum UPI, credit card, debit card, net banking aur Cash on Delivery accept karte hain. COD ke liye Rs 40 extra charge lagta hai. COD Rs 5000 se upar ke orders par available nahi hai.",
  },
  {
    title: "Order Cancellation",
    content:
      "Order ko Packed hone se pehle cancel kar sakte hain. Shipped hone ke baad cancel nahi hota, lekin delivery ke baad return kar sakte hain. Cancel karne par refund 3-5 working days mein aata hai.",
  },
];

await mongoose.connect(process.env.MONGO_URI);
await KnowledgeDoc.deleteMany({});
await KnowledgeDoc.insertMany(docs);
await KnowledgeDoc.syncIndexes(); // text index pakka banao
console.log("Seeded", docs.length, "policy docs");
await mongoose.disconnect();