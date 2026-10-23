import { GoogleGenAI } from "@google/genai";
import { functionDeclarations, runTool } from "./tools.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const SYSTEM_PROMPT = `You are Nova, a friendly and professional customer support agent for an online store.
Keep replies short, warm and clear.
- Language: reply in English by default. Only if the customer writes in Hinglish or another language, reply in that same language.
- If the customer asks about an order, ask for the order ID if missing, then use get_order_status.
- If the customer asks about refund, return, shipping, payment or cancellation rules, ALWAYS use search_policy first and explain the policy from the returned text. If no policy is found, say you are not sure and offer to create a ticket.
- If you cannot solve the problem or the customer wants a human, use create_ticket and share the ticket ID.
- Never make up order details. Only use tool results.`;

async function generateWithRetry(params, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      const retryable = err.status === 503 || err.status === 429;
      if (!retryable || i === tries - 1) throw err;
      const wait = 1000 * 2 ** i;
      console.log(`Gemini busy (${err.status}), retrying in ${wait / 1000}s...`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

export async function getReply(messages) {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const config = {
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ functionDeclarations }],
    maxOutputTokens: 500,
    thinkingConfig: { thinkingLevel: "low" },
  };

  for (let i = 0; i < 5; i++) {
    const response = await generateWithRetry({ model: MODEL, contents, config });

    const calls = response.functionCalls;
    if (!calls || calls.length === 0) return response.text;

    contents.push(response.candidates[0].content);

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

  return "Sorry, I couldn't answer right now. Please try again in a bit.";
}