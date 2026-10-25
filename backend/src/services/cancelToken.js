import crypto from "node:crypto";

const secret = () => process.env.CANCEL_SECRET || "dev-only-secret-change-me";

// Signed, short-lived token that proves "the server offered to cancel this order"
export function signCancel(orderId, ttlMs = 5 * 60 * 1000) {
  const payload = Buffer.from(JSON.stringify({ o: orderId, e: Date.now() + ttlMs })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

// Returns the orderId if the token is valid and not expired, otherwise null
export function verifyCancel(token = "") {
  const [payload, sig] = String(token).split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const d = JSON.parse(Buffer.from(payload, "base64url").toString());
    return d.e > Date.now() ? d.o : null;
  } catch {
    return null;
  }
}
