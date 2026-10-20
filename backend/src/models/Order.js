import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerName: String,
    status: {
      type: String,
      enum: ["Packed", "Shipped", "Out for delivery", "Delivered", "Cancelled"],
    },
    items: [String],
    eta: String,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);