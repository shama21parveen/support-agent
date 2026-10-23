import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X, Ticket } from "lucide-react";
import { chips } from "../data.js";
import Timeline from "./Timeline.jsx";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
export function Orb({ size = 64, state = "idle" }) { return <div className={"orb " + state} style={{ "--s": size + "px" }} />; }

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
      setMsgs((x) => [...x, { role: "assistant", text: d.reply }]);
    } catch {
      setMsgs((x) => [...x, { role: "assistant", error: true, text: "Can't reach Nova right now. Make sure the backend is running on port 5000, then try again." }]);
    }
    setBusy(false);
  }
  return (<>
    <motion.button className="fab" onClick={() => setOpen(!open)} whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} aria-label="Toggle Nova chat">
      {open ? <X size={26} /> : <><Orb size={34} /><span>Ask Nova</span><i className="ping" /></>}
    </motion.button>
    <AnimatePresence>
      {open && (
        <motion.div className="chat" initial={{ opacity: 0, y: 40, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.92 }} transition={{ type: "spring", damping: 22, stiffness: 260 }}>
          <header>
            <Orb size={42} state={busy ? "think" : "idle"} />
            <div><b>Nova</b><small><i className={"live" + (ok === false ? " off" : "")} />{busy ? hint(last) : ok === false ? "Offline, start the backend" : "Online, replies in seconds"}</small></div>
            <button onClick={() => setOpen(false)} aria-label="Close"><X size={20} /></button>
          </header>
          <div className="msgs">
            {msgs.map((m, i) => (
              <motion.div key={i} className={"msg " + m.role + (m.error ? " err" : "")} initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
                <Text t={m.text} />
                {m.role === "assistant" && extra(m, msgs[i - 1]?.text)}
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
