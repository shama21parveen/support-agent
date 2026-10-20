import Conversation from "../models/Conversation.js";
import { getReply } from "../services/llm.service.js";

export async function sendMessage(req, res) {
  try {
    const { message, conversationId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Purani conversation dhundo ya nayi banao
    let conversation = conversationId
      ? await Conversation.findById(conversationId)
      : null;

    if (!conversation) {
      conversation = new Conversation({ messages: [] });
    }

    conversation.messages.push({ role: "user", content: message });

    // LLM ko poori history bhejo
    const history = conversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const reply = await getReply(history);

    conversation.messages.push({ role: "assistant", content: reply });
    await conversation.save();

    res.json({ reply, conversationId: conversation._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}