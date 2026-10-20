import { GoogleGenAI } from "@google/genai";
import { functionDeclarations, runTool } from "./tools.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are Nova, a friendly customer support agent for an online store.
Keep replies short, polite and helpful.
- If the customer asks about an order, ask for the order ID if missing, then use get_order_status.
- If the customer asks about refund, return, shipping, payment or cancellation rules, ALWAYS use search_policy first and explain the policy in detail from the returned text. Only after that, you may ask if they need help with a specific order. If no policy is found, say you are not sure and offer to create a ticket.
- If you cannot solve the problem or the customer wants a human, use create_ticket and share the ticket ID.
- Never make up order details. Only use tool results.
Reply in the same language the customer uses.`;

const MODEL = "gemini-2.5-flash";

async function generateWithRetry(params, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      const retryable = err.status === 503 || err.status === 429;
      if (!retryable || i === tries - 1) throw err;
      const wait = 1000 * 2 ** i; // 1s, 2s, 4s
      console.log(`Gemini busy (${err.status}), ${wait / 1000}s baad retry...`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

export async function getReply(messages) {
  // Conversation ko Gemini ke format mein badlo
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const config = {
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ functionDeclarations }],
  };

  // Agent loop: jab tak model tool maange, tool chalao aur result wapas do
  for (let i = 0; i < 5; i++) {
    const response = await generateWithRetry({
      model: MODEL,
      contents,
      config,
    });

    const calls = response.functionCalls;
    if (!calls || calls.length === 0) {
      return response.text;
    }

    // Model ka tool-call wala turn history mein jodo
    contents.push(response.candidates[0].content);

    // Har tool chalao aur result jodo
    const resultParts = [];
    for (const call of calls) {
      console.log("Tool call:", call.name, call.args);
      const output = await runTool(call.name, call.args);
      resultParts.push({
        functionResponse: { name: call.name, response: { result: output } },
      });
    }
    contents.push({ role: "user", parts: resultParts });
  }

  return "Maaf kijiye, abhi jawab nahi de pa raha. Thodi der baad try karein.";
}