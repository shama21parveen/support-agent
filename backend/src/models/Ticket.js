import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    issue: { type: String, required: true },
    orderId: String,
    status: { type: String, default: "Open" },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);