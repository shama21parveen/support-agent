import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X, Ticket, Check, AlertTriangle } from "lucide-react";
import { chips } from "../data.js";
import Timeline from "./Timeline.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
export function Orb({ size = 64, state = "idle" }) { return <div className={"orb " + state} style={{ "--s": size + "px" }} />; }

const MOUTHS = ["M41 67Q50 76 59 67", "M39 66Q50 80 61 66", "M36 65Q50 86 64 65", "M34 64Q50 90 66 64Z", "M33 63Q50 96 67 63Z"];
export function Mascot({ size = 44, busy = false }) {
  const [lv, setLv] = useState(0);
  useEffect(() => {
    if (lv === 0) return;
    const t = setTimeout(() => setLv((v) => Math.max(0, v - 1)), lv === 4 ? 2400 : 1800);
    return () => clearTimeout(t);
  }, [lv]);
  const arcs = lv >= 3;
  return (
    <span className="mwrap" onClick={() => setLv((v) => Math.min(4, v + 1))} title="Tap me, I'm ticklish">
      <svg className={"mascot lv" + lv + (busy ? " busy" : "")} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
        <defs><radialGradient id="mg" cx=".3" cy=".25" r=".95"><stop offset="0" stopColor="#fff" /><stop offset=".3" stopColor="#d9c6ff" /><stop offset=".7" stopColor="#9b6bf0" /><stop offset="1" stopColor="#ff9ec7" /></radialGradient></defs>
        <circle cx="50" cy="54" r="38" fill="url(#mg)" />
        {arcs ? (<>
          <path d="M30 55Q37 45 44 55" stroke="#2a2347" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M56 55Q63 45 70 55" stroke="#2a2347" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>) : (
          <g className="eyes"><ellipse cx="37" cy="52" rx="5.5" ry={lv === 2 ? 5.5 : 7.5} fill="#2a2347" /><ellipse cx="63" cy="52" rx="5.5" ry={lv === 2 ? 5.5 : 7.5} fill="#2a2347" />{lv < 2 && <><circle cx="39" cy="49" r="2" fill="#fff" /><circle cx="65" cy="49" r="2" fill="#fff" /></>}</g>
        )}
        <circle cx="26" cy="64" r={5 + lv} fill="#ff8fb1" opacity={0.5 + lv * 0.12} /><circle cx="74" cy="64" r={5 + lv} fill="#ff8fb1" opacity={0.5 + lv * 0.12} />
        <path className="mouth" d={MOUTHS[lv]} stroke="#2a2347" strokeWidth="3.5" fill={lv >= 3 ? "#2a2347" : "none"} strokeLinecap="round" strokeLinejoin="round" />
        {lv === 4 && <><ellipse cx="50" cy="80" rx="9" ry="5" fill="#ff8fb1" /><path d="M24 58q-4 8 0 11q4-3 0-11z" fill="#7fd4ff" /><path d="M76 58q-4 8 0 11q4-3 0-11z" fill="#7fd4ff" /></>}
        <path className="spark" d="M82 12l2.6 7 7 2.6-7 2.6L82 31l-2.6-7-7-2.6 7-2.6z" fill="#ff7eb6" />
      </svg>
      {lv === 4 && <span className="haha"><b>ha</b><b>ha</b><b>ha!</b></span>}
    </span>
  );
}

function CancelCard({ a, onConfirm, onKeep }) {
  const s = a.state || "pending";
  if (s === "done") return <div className="ccard done"><span className="okmark"><Check size={18} /></span><div><b>Order {a.orderId} cancelled</b><small>Refund arrives in {a.refund}</small></div></div>;
  if (s === "kept") return <div className="ccard kept"><div><b>Got it, your order stays</b><small>{a.orderId} is still on its way.</small></div></div>;
  return (
    <div className="ccard">
      <div className="chead"><AlertTriangle size={18} /><b>Cancel order {a.orderId}?</b></div>
      <small>{a.items.join(", ")}</small>
      <small>This can't be undone. Your refund arrives in 3-5 working days.</small>
      {s === "error" && <small className="err">{a.err}</small>}
      <div className="cbtn">
        <button className="no" onClick={onKeep} disabled={s === "working"}>Keep order</button>
        <button className="yes" onClick={onConfirm} disabled={s === "working"}>{s === "working" ? "Cancelling..." : "Yes, cancel it"}</button>
      </div>
    </div>
  );
}

const hint = (t = "") => /ORD\d+/i.test(t) ? "Checking your order..." : /human|agent|ticket|damag|complain/i.test(t) ? "Opening a ticket..." : /refund|return|ship|pay|cancel|policy|cod/i.test(t) ? "Reading our policies..." : "Thinking...";
function Text({ t }) { return t.split(/(\*\*[^*]+\*\*)/g).map((p, i) => p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>); }
function extra(m, prev) {
  const tk = m.text.match(/TKT\d+/);
  if (tk) return <div className="tcard"><Ticket size={18} /><div><b>{tk[0]}</b><small>Ticket open. A human will reach out soon.</small></div></div>;
  if (/ORD\d+/i.test(prev || "")) {
    const s = /out for delivery/i.test(m.text) ? 2 : /shipped/i.test(m.text) ? 1 : /packed/i.test(m.text) ? 0 : /delivered/i.test(m.text) ? 3 : -1;
    if (s >= 0) return <Timeline at={s} />;
  }
  return null;
}

export function useHealth() {
  const [ok, setOk] = useState(null);
  useEffect(() => {
    let on = true;
    const ping = async () => { try { const r = await fetch(API + "/health"); on && setOk(r.ok); } catch { on && setOk(false); } };
    ping(); const t = setInterval(ping, 15000);
    return () => { on = false; clearInterval(t); };
  }, []);
  return ok;
}

export default function Chat({ open, setOpen, ask }) {
  const ok = useHealth();
  const [msgs, setMsgs] = useState([{ role: "assistant", text: "Hey, I'm Nova. I can track an order, explain a policy or get you a human. What's up? Try **ORD1001**." }]);
  const [input, setInput] = useState(""), [busy, setBusy] = useState(false), [last, setLast] = useState("");
  const cid = useRef(null), end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy, open]);
  useEffect(() => { if (ask.id) { setOpen(true); send(ask.text); } }, [ask.id]);

  const patch = (i, p) => setMsgs((x) => x.map((m, k) => (k === i ? { ...m, act: { ...m.act, ...p } } : m)));
  async function confirmCancel(i) {
    patch(i, { state: "working" });
    try {
      const r = await fetch(API + "/api/orders/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: msgs[i].act.token }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not cancel");
      patch(i, { state: "done", refund: d.refundEta });
    } catch (e) { patch(i, { state: "error", err: e.message }); }
  }

  async function send(text) {
    const m = (text ?? input).trim();
    if (!m || busy) return;
    setInput(""); setLast(m); setBusy(true);
    setMsgs((x) => [...x, { role: "user", text: m }]);
    try {
      const r = await fetch(API + "/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: m, conversationId: cid.current }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      cid.current = d.conversationId;
      setMsgs((x) => [...x, { role: "assistant", text: d.reply, act: (d.actions || []).find((a) => a.type === "confirm_cancel") }]);
    } catch {
      setMsgs((x) => [...x, { role: "assistant", error: true, text: "Can't reach Nova right now. Make sure the backend is running on port 5000, then try again." }]);
    }
    setBusy(false);
  }
  return (<>
    <motion.button className="fab" onClick={() => setOpen(!open)} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} aria-label="Toggle Nova chat">
      {open ? <X size={26} /> : <><Mascot size={40} /><span>Ask Nova</span><i className="ping" /></>}
    </motion.button>
    <AnimatePresence>
      {open && (
        <motion.div className="chat" initial={{ opacity: 0, y: 40, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.92 }} transition={{ type: "spring", damping: 22, stiffness: 260 }}>
          <header>
            <Mascot size={46} busy={busy} />
            <div className="hd"><b>Nova</b><small><i className={"live" + (ok === false ? " off" : "")} />{busy ? hint(last) : ok === false ? "Offline, start the backend" : "Online, replies in seconds"}</small></div>
            <button onClick={() => setOpen(false)} aria-label="Close"><X size={20} /></button>
          </header>
          <div className="msgs">
            {msgs.map((m, i) => (
              <motion.div key={i} className={"msg " + m.role + (m.error ? " err" : "")} initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
                <Text t={m.text} />
                {m.act ? <CancelCard a={m.act} onConfirm={() => confirmCancel(i)} onKeep={() => patch(i, { state: "kept" })} /> : m.role === "assistant" && extra(m, msgs[i - 1]?.text)}
              </motion.div>
            ))}
            {busy && <div className="tool live-tool"><span className="spin" />{hint(last)}</div>}
            <div ref={end} />
          </div>
          {msgs.length < 3 && <div className="chips">{chips.map((c) => <button key={c} onClick={() => send(c)}>{c}</button>)}</div>}
          <form onSubmit={(e) => { e.preventDefault(); send(); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Nova anything..." />
            <button disabled={busy || !input.trim()} aria-label="Send"><Send size={18} /></button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  </>);
}
