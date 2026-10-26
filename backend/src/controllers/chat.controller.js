import Conversation from "../models/Conversation.js";
import { getReply } from "../services/llm.service.js";

export async function sendMessage(req, res) {
  try {
    const { message, conversationId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    let conversation = conversationId ? await Conversation.findById(conversationId) : null;
    if (!conversation) conversation = new Conversation({ messages: [] });

    conversation.messages.push({ role: "user", content: message });

    const history = conversation.messages.map((m) => ({ role: m.role, content: m.content }));
    const { text, actions } = await getReply(history);
    const reply = text || "Sorry, I couldn't answer that. Could you rephrase?";

    conversation.messages.push({ role: "assistant", content: reply });
    await conversation.save();

    res.json({ reply, actions, conversationId: conversation._id });
  } catch (err) {
    console.error("Chat error:", err.status || "", String(err.message || err).slice(0, 200));
    if (err.status === 429) {
      return res.status(429).json({ error: "Nova has used up today's free AI quota. Please try again later." });
    }
    if (err.status === 503 || /timeout|timed out|abort/i.test(`${err.name} ${err.message}`)) {
      return res.status(503).json({ error: "Nova is very busy right now. Please try again in a moment." });
    }
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
