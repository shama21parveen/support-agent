import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { timeout: 15000 } });
const skip = /live|audio|image|tts|embedding|robotics|transcribe|translate|vision|veo|imagen/i;

const names = [];
for await (const m of await ai.models.list()) {
  const n = m.name?.replace("models/", "");
  if (n && /flash/i.test(n) && !skip.test(n) && (!m.supportedActions || m.supportedActions.includes("generateContent"))) {
    names.push(n);
  }
}
console.log("Testing:", names.join(", "), "\n");

for (const model of names.slice(0, 8)) {
  const t = Date.now();
  try {
    await ai.models.generateContent({ model, contents: "Reply with just: ok", config: { maxOutputTokens: 20 } });
    console.log(`OK   ${model}  ${Date.now() - t}ms`);
  } catch (e) {
    console.log(`FAIL ${model}  ${Date.now() - t}ms  (${e.status || e.name})`);
  }
}