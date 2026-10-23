import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ShoppingBag, PackageSearch, ScrollText, Ticket, Heart, Star, Plus, Minus, X, Check, Github, Linkedin, Mail } from "lucide-react";
import Chat, { Orb, useHealth } from "./components/Chat.jsx";
import Timeline from "./components/Timeline.jsx";
import Drawer from "./components/Drawer.jsx";
import Cursor from "./components/Cursor.jsx";
import Scene3D from "./components/Scene3D.jsx";
import { products } from "./data.js";

const inr = (n) => "₹" + n.toLocaleString("en-IN");

function Hero({ ask }) {
  return (
    <section className="hero wrap">
      <div>
        <h1>Support that actually slaps.</h1>
        <p>Nova checks your order, knows every policy and files tickets while you sip your chai. No hold music. No cap.</p>
        <div className="row">
          <button className="btn pri" onClick={() => ask("Where's my order ORD1001?")}>Track my order</button>
          <a className="btn gh" href="#store">Shop the drop</a>
        </div>
      </div>
      <motion.div className="glass demo" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}>
        <div className="demo-h"><Orb size={36} /><b>Smart Chat</b></div>
        <div className="msg user">Where's my order ORD1001?</div>
        <div className="tool">Checking order ORD1001...</div>
        <div className="msg assistant">Good news: it has <strong>shipped</strong> and lands in about 2 days.<Timeline at={1} /></div>
        <div className="msg user">How long do refunds take?</div>
        <div className="msg assistant">Once approved, refunds hit your original payment method in <strong>5-7 working days</strong>.</div>
      </motion.div>
    </section>
  );
}

function Story() {
  const ref = useRef(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const s1 = useTransform(p, [0, 0.05, 0.3, 0.4], [1, 1, 1, 0]);
  const s2 = useTransform(p, [0.3, 0.4, 0.6, 0.7], [0, 1, 1, 0]);
  const s3 = useTransform(p, [0.6, 0.7, 1], [0, 1, 1]);
  return (
    <section id="story" ref={ref} className="story">
      <div className="sticky">
        <motion.div className="scene" style={{ opacity: s1 }}>
          <h2>2 a.m. Your order is MIA.</h2>
          <p>You message support. The reply: "We'll get back to you soon." Soon is doing a lot of work here.</p>
        </motion.div>
        <motion.div className="scene" style={{ opacity: s2 }}>
          <h2>You're #47 in the queue. Bestie, no.</h2>
          <p>Hold music on loop. Your call is "important to us."</p>
          <div className="queue"><i /></div>
        </motion.div>
        <motion.div className="scene" style={{ opacity: s3 }}>
          <Orb size={110} />
          <h2>Then Nova pulled up. Vibes restored.</h2>
          <p>Straight from the database, in seconds. Keep scrolling to see how it works.</p>
        </motion.div>
      </div>
    </section>
  );
}

const tabs = [
  { k: "Track an order", user: "Where's my order ORD1002?", tool: "get_order_status('ORD1002')", card: <Timeline at={2} />, reply: "It's **out for delivery** and should reach you this evening. Hang tight!" },
  { k: "Ask a policy", user: "Can I return my headphones?", tool: "search_policy('return')", reply: "Yes, within **7 days** of delivery, unused and in the original packaging. Pickup is free if the item arrived damaged." },
  { k: "Reach a human", user: "My order arrived damaged. I want a human.", tool: "create_ticket(issue, 'ORD1003')", card: <div className="tcard"><Ticket size={18} /><div><b>TKT5041</b><small>Ticket open</small></div></div>, reply: "So sorry about that. I've opened ticket **TKT5041** and a human will reach out soon." },
];
function Features() {
  const [i, setI] = useState(0);
  const t = tabs[i];
  return (
    <section id="features" className="wrap sec">
      <h2>Nova doesn't just chat. It gets things done.</h2>
      <p className="sub">Pick a scenario and watch the agent think, use a tool and answer.</p>
      <div className="glass lab">
        <div className="tabs">{tabs.map((x, n) => <button key={x.k} className={n === i ? "on" : ""} onClick={() => setI(n)}>{x.k}</button>)}</div>
        <div className="lab-body" key={i}>
          <div className="msg user pop" style={{ "--d": "0s" }}>{t.user}</div>
          <div className="tool pop" style={{ "--d": ".6s" }}><span className="spin" />Tool: {t.tool}</div>
          <div className="msg assistant pop" style={{ "--d": "1.3s" }}><span>{t.reply.split(/(\*\*[^*]+\*\*)/g).map((s, n) => s.startsWith("**") ? <strong key={n}>{s.slice(2, -2)}</strong> : s)}</span>{t.card}</div>
        </div>
      </div>
      <div className="bento">
        <div className="glass c"><PackageSearch /><h3>Real actions</h3><p>Nova checks live orders and creates tickets. It's an agent, not just a chat box.</p></div>
        <div className="glass c"><ScrollText /><h3>Grounded answers</h3><p>Answers come only from your real policies. If it's not in there, Nova won't make it up.</p></div>
        <div className="glass c"><Star /><h3>Speaks your language</h3><p>Replies in English by default, and switches when you do.</p></div>
      </div>
    </section>
  );
}

function Prod({ p, onAdd, ask }) {
  const [sw, setSw] = useState(0), [fav, setFav] = useState(false), [done, setDone] = useState(false);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const rx = useSpring(mx, { stiffness: 200, damping: 18 }), ry = useSpring(my, { stiffness: 200, damping: 18 });
  const hues = [0, 85, 200];
  return (
    <motion.div className="glass prod" style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); mx.set(-((e.clientY - r.top) / r.height - 0.5) * 14); my.set(((e.clientX - r.left) / r.width - 0.5) * 14); }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}>
      <div className="pic" style={{ background: p.tone, filter: `hue-rotate(${hues[sw]}deg)` }}>
        <span>{p.emoji}</span><em>{p.tag}</em>
        <motion.button className={"heart" + (fav ? " on" : "")} whileTap={{ scale: 1.5 }} onClick={() => setFav(!fav)} aria-label="Wishlist"><Heart size={17} fill={fav ? "currentColor" : "none"} /></motion.button>
      </div>
      <h3>{p.name}</h3>
      <div className="rate"><Star size={14} fill="currentColor" />{p.rating}<small>({p.reviews})</small></div>
      <div className="swatches">{["#ffb3c7", "#b9a2ff", "#9fd0ff"].map((c, n) => <button key={c} className={n === sw ? "on" : ""} style={{ background: c }} onClick={() => setSw(n)} aria-label="Color" />)}</div>
      <div className="price">{inr(p.price)}</div>
      <div className="row">
        <button className={"btn pri sm" + (done ? " ok" : "")} onClick={(e) => { onAdd(p, e.currentTarget.closest(".prod").querySelector(".pic span")); setDone(true); setTimeout(() => setDone(false), 1400); }}>{done ? <><Check size={15} />&nbsp;Added</> : "Add to cart"}</button>
        <button className="btn gh sm" onClick={() => ask(`What are the shipping and return rules for the ${p.name}?`)}>Ask Nova</button>
      </div>
    </motion.div>
  );
}

function Footer() {
  const ok = useHealth();
  const ext = { target: "_blank", rel: "noreferrer" };
  return (
    <footer className="foot">
      <div className="glass foot-in">
        <div className="fcol brand">
          <div className="logo"><Orb size={30} />Nova Store</div>
          <p>Support that actually slaps. An AI agent that tracks orders, knows the policies and files tickets.</p>
          <div className="stack">{["React", "Node.js", "Express", "MongoDB", "Gemini", "RAG"].map((t) => <span key={t}>{t}</span>)}</div>
        </div>
        <div className="fcol"><h4>Explore</h4><a href="#story">Story</a><a href="#features">Features</a><a href="#store">The Drop</a></div>
        <div className="fcol"><h4>Connect</h4>
          <a href="mailto:shama21parveen@gmail.com"><Mail size={16} />Email</a>
          <a href="https://github.com/shama21parveen" {...ext}><Github size={16} />GitHub</a>
          <a href="https://www.linkedin.com/in/shama-parveen-956258229" {...ext}><Linkedin size={16} />LinkedIn</a>
        </div>
        <div className="fcol"><h4>Status</h4>
          <span className="stat"><i className={"live" + (ok === false ? " off" : "")} />{ok === null ? "Checking..." : ok ? "All systems go" : "Backend offline"}</span>
          <a href="#" className="btn gh sm top">Back to top ↑</a>
        </div>
      </div>
      <p className="copy">© {new Date().getFullYear()} Shama Parveen. Built with MERN, Gemini and way too much chai. ☕</p>
    </footer>
  );
}

export default function App() {
  const [open, setOpen] = useState(false), [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState({}), [flies, setFlies] = useState([]);
  const [ask, setAsk] = useState({ id: 0, text: "" });
  const askNova = (text) => setAsk({ id: Date.now(), text });
  const { scrollYProgress: sp } = useScroll();
  const items = Object.values(cart);
  const count = items.reduce((a, b) => a + b.qty, 0), total = items.reduce((a, b) => a + b.qty * b.p.price, 0);
  const bump = (p, d) => setCart((c) => { const q = (c[p.name]?.qty || 0) + d; const n = { ...c }; if (q <= 0) delete n[p.name]; else n[p.name] = { p, qty: q }; return n; });
  const add = (p, el) => {
    const a = el.getBoundingClientRect(), b = document.getElementById("cart-btn").getBoundingClientRect();
    setFlies((f) => [...f, { id: Math.random(), p, x: a.left, y: a.top, tx: b.left, ty: b.top }]);
  };
  const land = (f) => { setFlies((x) => x.filter((i) => i.id !== f.id)); bump(f.p, 1); };
  return (
    <>
      <Cursor /><Scene3D />
      <motion.div className="progress" style={{ scaleX: sp }} />
      <nav className="nav glass">
        <a href="#" className="logo"><Orb size={28} />Nova Store</a>
        <div className="links"><a href="#story">Story</a><a href="#features">Features</a><a href="#store">The Drop</a></div>
        <div className="row">
          <button id="cart-btn" className="cart" onClick={() => setCartOpen(true)} aria-label="Open cart"><ShoppingBag size={19} /><motion.span key={count} initial={{ scale: 1.9 }} animate={{ scale: 1 }} className="badge">{count}</motion.span></button>
          <button className="btn pri sm" onClick={() => setOpen(true)}>Talk to Nova</button>
        </div>
      </nav>
      <Hero ask={askNova} />
      <Story />
      <Features />
      <section id="store" className="wrap sec">
        <h2>The Drop</h2>
        <p className="sub">Fresh picks, zero stress. Ask Nova anything before you buy.</p>
        <div className="grid">{products.map((p) => <Prod key={p.name} p={p} onAdd={add} ask={askNova} />)}</div>
      </section>
      <Footer />
      {flies.map((f) => (
        <motion.div key={f.id} className="fly" initial={{ x: f.x, y: f.y, scale: 1, opacity: 1 }} animate={{ x: f.tx, y: [f.y, f.y - 110, f.ty], scale: 0.35, rotate: 360 }} transition={{ duration: 0.85, ease: "easeInOut", times: [0, 0.4, 1] }} onAnimationComplete={() => land(f)}>{f.p.emoji}</motion.div>
      ))}
      <Drawer open={cartOpen} close={() => setCartOpen(false)} items={items} change={bump} total={total} clear={() => setCart({})} ask={askNova} />
      <Chat open={open} setOpen={setOpen} ask={ask} />
    </>
  );
}
