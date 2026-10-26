import { GoogleGenAI } from "@google/genai";
import { functionDeclarations, runTool } from "./tools.js";

// Comma-separated list in .env. Models are tried in order; one that fails is skipped for a while.
const MODELS = (process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || "gemini-3-flash-preview")
  .split(",").map((s) => s.trim()).filter(Boolean);
const TIMEOUT = Number(process.env.GEMINI_TIMEOUT_MS) || 20000;

// timeout: a stuck call fails after TIMEOUT ms instead of hanging for minutes
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { timeout: TIMEOUT } });

const SYSTEM_PROMPT = `You are Nova, a friendly and professional customer support agent for an online store.
Keep replies short, warm and clear.
- Language: reply in English by default. Only if the customer writes in Hinglish or another language, reply in that same language.
- If the customer asks about an order, ask for the order ID if missing, then use get_order_status.
- If the customer asks about refund, return, shipping, payment or cancellation rules, ALWAYS use search_policy first and explain the policy from the returned text. If no policy is found, say you are not sure and offer to create a ticket.
- If the customer wants to cancel an order, ask for the order ID if missing, then call cancel_order. This only shows a confirmation card. You can never cancel an order yourself. Never say an order is cancelled until the customer has pressed the confirm button. If cancel_order says the order cannot be cancelled, explain why in one or two sentences and offer a return or a ticket.
- If you cannot solve the problem or the customer wants a human, use create_ticket and share the ticket ID.
- Never make up order details. Only use tool results.`;

// model -> timestamp until which we skip it (quota used up, not found, or overloaded)
const benched = new Map();
const bench = (model, ms) => benched.set(model, Date.now() + ms);

async function generateWithRetry(params) {
  let pool = MODELS.filter((m) => (benched.get(m) || 0) < Date.now());
  if (pool.length === 0) pool = MODELS; // everything is benched: try them all anyway
  let lastErr;
  for (const model of pool) {
    try {
      const response = await ai.models.generateContent({ ...params, model });
      console.log(`Answered by ${model}`);
      return response;
    } catch (err) {
      lastErr = err;
      if (err.status === 429) bench(model, 30 * 60 * 1000);      // daily quota used up
      else if (err.status === 404) bench(model, 60 * 60 * 1000); // model not available for this key
      else bench(model, 60 * 1000);                              // busy, timeout or other error
      console.log(`Model ${model} failed (${err.status || err.name}). Trying next...`);
    }
  }
  throw lastErr;
}

// Returns { text, actions }. "actions" are UI instructions (like a confirm-cancel card)
export async function getReply(messages) {
  const started = Date.now();

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const config = {
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ functionDeclarations }],
    maxOutputTokens: 1024,
  };

  const actions = [];

  for (let i = 0; i < 5; i++) {
    const t0 = Date.now();
    const response = await generateWithRetry({ contents, config });
    console.log(`Gemini call ${i + 1} took ${Date.now() - t0}ms`);

    const calls = response.functionCalls;
    if (!calls || calls.length === 0) {
      console.log(`Total reply time: ${Date.now() - started}ms`);
      return { text: response.text, actions };
    }

    contents.push(response.candidates[0].content);

    const resultParts = [];
    for (const call of calls) {
      console.log("Tool call:", call.name, call.args);
      const t1 = Date.now();
      const output = await runTool(call.name, call.args);
      console.log(`Tool ${call.name} took ${Date.now() - t1}ms`);
      const { _action, ...forModel } = output; // the model never sees the secret token
      if (_action) actions.push(_action);
      resultParts.push({ functionResponse: { name: call.name, response: { result: forModel } } });
    }
    contents.push({ role: "user", parts: resultParts });
  }

  return { text: "Sorry, I couldn't answer right now. Please try again in a bit.", actions };
}
