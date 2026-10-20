import mongoose from "mongoose";

const knowledgeDocSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

// Text index: isse MongoDB title aur content mein keyword search kar sakta hai
knowledgeDocSchema.index({ title: "text", content: "text" });

export default mongoose.model("KnowledgeDoc", knowledgeDocSchema);