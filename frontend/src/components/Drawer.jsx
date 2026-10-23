import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Check, ArrowLeft } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const inr = (n) => "₹" + n.toLocaleString("en-IN");

export default function Drawer({ open, close, items, change, total, clear, ask }) {
  const [step, setStep] = useState("cart");
  const [f, setF] = useState({ name: "", phone: "", address: "", pay: "UPI" });
  const [busy, setBusy] = useState(false), [err, setErr] = useState(""), [done, setDone] = useState(null);
  const [bits] = useState(() => Array.from({ length: 20 }, (_, i) => ({ x: (Math.random() - 0.5) * 340, y: -Math.random() * 260 - 40, e: ["🎉", "✨", "💜", "🛍️"][i % 4] })));
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ship = total >= 499 ? 0 : 49, cod = f.pay === "COD" ? 40 : 0, grand = total + ship + cod;
  const codBlocked = total > 5000;
  const valid = f.name.trim() && /^\d{10}$/.test(f.phone) && f.address.trim().length > 5 && !(f.pay === "COD" && codBlocked);

  const shut = () => { close(); setTimeout(() => { if (step === "done") { setStep("cart"); setDone(null); } }, 300); };
  async function place() {
    setBusy(true); setErr("");
    try {
      const r = await fetch(API + "/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: f.name, items: items.map(({ p, qty }) => ({ name: p.name, qty })) }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDone(d.orderId); clear(); setStep("done");
    } catch { setErr("Couldn't place the order. Make sure the backend is running."); }
    setBusy(false);
  }

  return (
    <AnimatePresence>
      {open && (<>
        <motion.div className="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={shut} />
        <motion.aside className="drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 260 }}>
          <header>
            {step === "details" ? <button onClick={() => setStep("cart")} aria-label="Back"><ArrowLeft size={20} /></button> : <span />}
            <h3>{step === "cart" ? "Your cart" : step === "details" ? "Checkout" : "Order placed"}</h3>
            <button onClick={shut} aria-label="Close"><X size={20} /></button>
          </header>

          {step === "cart" && (<>
            <div className="cart-list">
              {items.length === 0 && <p className="empty">Your cart's empty. Go fix that. 🛍️</p>}
              {items.map(({ p, qty }) => (
                <motion.div layout key={p.name} className="ci" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="ce" style={{ background: p.tone }}>{p.emoji}</div>
                  <div className="cn"><b>{p.name}</b><small>{inr(p.price)}</small></div>
                  <div className="qty"><button onClick={() => change(p, -1)}><Minus size={14} /></button>{qty}<button onClick={() => change(p, 1)}><Plus size={14} /></button></div>
                </motion.div>
              ))}
            </div>
            <footer>
              <div className="tot"><span>Subtotal</span><b>{inr(total)}</b></div>
              {total > 0 && total < 499 && <small className="hint">Add {inr(499 - total)} more for free shipping</small>}
              <button className="btn pri" disabled={!items.length} onClick={() => setStep("details")}>Continue to checkout</button>
            </footer>
          </>)}

          {step === "details" && (<>
            <div className="cart-list form">
              <label>Full name<input value={f.name} onChange={set("name")} placeholder="Shama Parveen" /></label>
              <label>Phone (10 digits)<input value={f.phone} onChange={set("phone")} inputMode="numeric" maxLength={10} placeholder="98XXXXXXXX" /></label>
              <label>Delivery address<textarea value={f.address} onChange={set("address")} rows={3} placeholder="House, street, city, PIN" /></label>
              <div className="pays">
                {["UPI", "Card", "COD"].map((m) => (
                  <button key={m} type="button" disabled={m === "COD" && codBlocked} className={f.pay === m ? "on" : ""} onClick={() => setF({ ...f, pay: m })}>{m === "COD" ? "Cash on Delivery" : m}</button>
                ))}
              </div>
              {codBlocked && <small className="hint">COD isn't available above ₹5,000.</small>}
              <div className="sum">
                <div><span>Subtotal</span><span>{inr(total)}</span></div>
                <div><span>Shipping</span><span>{ship ? inr(ship) : "Free"}</span></div>
                {cod > 0 && <div><span>COD fee</span><span>{inr(cod)}</span></div>}
              </div>
              <small className="hint">Demo checkout. No real payment is taken.</small>
              {err && <small className="err">{err}</small>}
            </div>
            <footer>
              <div className="tot"><span>Total</span><b>{inr(grand)}</b></div>
              <button className="btn pri" disabled={!valid || busy} onClick={place}>{busy ? "Placing your order..." : "Place order"}</button>
            </footer>
          </>)}

          {step === "done" && (
            <div className="success">
              {bits.map((b, i) => <motion.span key={i} className="bit" initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }} animate={{ x: b.x, y: b.y + 260, opacity: 0, rotate: 360, scale: 1.2 }} transition={{ duration: 1.8, ease: "easeOut" }}>{b.e}</motion.span>)}
              <motion.div className="tick" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }}><Check size={42} /></motion.div>
              <h3>You're all set!</h3>
              <p>Your order <b>{done}</b> is packed and on its way. We'll keep you posted.</p>
              <button className="btn pri" onClick={() => { ask(`Where's my order ${done}?`); shut(); }}>Track it with Nova</button>
              <button className="btn gh" onClick={shut}>Keep shopping</button>
            </div>
          )}
        </motion.aside>
      </>)}
    </AnimatePresence>
  );
}
