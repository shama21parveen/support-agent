import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform, useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";
import { ShoppingBag, PackageSearch, ScrollText, Ticket, Heart, Star, Plus, Minus, X, Check, Github, Linkedin, Mail } from "lucide-react";
import Chat, { Orb, Mascot, useHealth } from "./components/Chat.jsx";
import Timeline from "./components/Timeline.jsx";
import Drawer from "./components/Drawer.jsx";
import Scene3D from "./components/Scene3D.jsx";
import { products } from "./data.js";

const inr = (n) => "₹" + n.toLocaleString("en-IN");

const words = ["slaps.", "hits different.", "gets you.", "delivers."];
function RotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % words.length), 2400); return () => clearInterval(t); }, []);
  return (
    <span className="rot"><AnimatePresence mode="wait">
      <motion.span key={i} className="grad" initial={{ y: 30, opacity: 0, filter: "blur(8px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: -30, opacity: 0, filter: "blur(8px)" }} transition={{ duration: 0.4 }}>{words[i]}</motion.span>
    </AnimatePresence></span>
  );
}

function Marquee() {
  const t = ["No hold music", "No cap", "Order tracking", "Refund answers", "Human backup", "Speaks your language", "24/7 vibes"];
  return <div className="marq"><div className="track">{[...t, ...t].map((x, i) => <span key={i}>{x}<i>✦</i></span>)}</div></div>;
}

function SplitText({ text }) {
  return (
    <motion.h2 className="split" aria-label={text} initial="h" whileInView="v" viewport={{ once: true }} variants={{ h: {}, v: { transition: { staggerChildren: 0.07 } } }}>
      {text.split(" ").map((w, i) => (
        <span className="w" key={i}><motion.span style={{ display: "inline-block" }} variants={{ h: { y: "110%", opacity: 0, rotate: 6 }, v: { y: 0, opacity: 1, rotate: 0 } }} transition={{ type: "spring", damping: 16, stiffness: 140 }}>{w}&nbsp;</motion.span></span>
      ))}
    </motion.h2>
  );
}

const scenes = [
  { u: "Where's my order ORD1001?", t: "Checking order ORD1001...", r: <>Good news: it has <strong>shipped</strong> and lands in about 2 days.<Timeline at={1} /></> },
  { u: "How long do refunds take?", t: "Reading our policies...", r: <>Once approved, refunds hit your original payment method in <strong>5-7 working days</strong>.<div className="stat"><b>5-7</b><span>working days to your account</span></div></> },
  { u: "My parcel arrived damaged. Help!", t: "Opening a ticket...", r: <>So sorry! I've opened ticket <strong>TKT5041</strong>. A human will reach out soon.<div className="tcard"><Ticket size={18} /><div><b>TKT5041</b><small>Ticket open</small></div></div></> },
];
function DemoChat() {
  const [s, setS] = useState(0), [st, setSt] = useState(0);
  useEffect(() => {
    setSt(0);
    const t = [setTimeout(() => setSt(1), 500), setTimeout(() => setSt(2), 1500), setTimeout(() => setSt(3), 3000), setTimeout(() => setS((x) => (x + 1) % scenes.length), 7500)];
    return () => t.forEach(clearTimeout);
  }, [s]);
  const sc = scenes[s];
  const pop = { initial: { opacity: 0, y: 14, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 } };
  return (
    <motion.div className="glass demo" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}>
      <div className="demo-h"><Mascot size={46} busy={st === 2} /><div className="hd2"><b>Nova<em className="role">AI Support Agent</em></b><small><i className="live" />{st === 2 ? "working on it..." : "online"}</small></div></div>
      <div className="demo-body" key={s}>
        {st >= 1 && <motion.div className="msg user" {...pop}>{sc.u}</motion.div>}
        {st === 2 && <motion.div className="tool" {...pop}><span className="spin" />{sc.t}</motion.div>}
        {st >= 3 && <motion.div className="msg assistant" {...pop}>{sc.r}</motion.div>}
      </div>
      <div className="dotsrow">{scenes.map((_, i) => <i key={i} className={i === s ? "on" : ""} />)}</div>
    </motion.div>
  );
}

function Cta({ onOpen }) {
  return (
    <section className="cta wrap sec">
      <div className="glass cta-in">
        <Mascot size={120} />
        <SplitText text="Ready to skip the hold music?" />
        <p>Say hi to Nova. It's online, it's fast and it never puts you on hold.</p>
        <button className="btn pri" onClick={onOpen}>Chat with Nova</button>
        <small>Psst... your cursor just got a glow-up. Also, tap Nova's face. It's ticklish.</small>
      </div>
    </section>
  );
}

function Hero({ ask }) {
  return (
    <section className="hero wrap">
      <span className="stk s1">🎧</span><span className="stk s2">📦</span><span className="stk s3">✨</span><span className="stk s4">💜</span>
      <div>
        <div className="agentbadge"><i className="live" />AI Support Agent · online 24/7</div>
        <h1>Support that actually <RotatingWord /></h1>
        <p>Meet Nova, your AI support agent. It tracks orders, knows every policy and opens tickets while you sip your chai. No hold music. No cap.</p>
        <div className="row">
          <button className="btn pri" onClick={() => ask("Where's my order ORD1001?")}>Track my order</button>
          <a className="btn gh" href="#store">Shop the drop</a>
        </div>
        <div className="quick"><small>Ask Nova right now:</small>{[["📦 Track an order", "Where's my order ORD1001?"], ["📜 Refund policy", "How long do refunds take?"], ["🎫 Talk to a human", "I need a human"]].map(([l, q]) => <button key={l} onClick={() => ask(q)}>{l}</button>)}</div>
        <div className="hstats"><div><b>3</b><span>built-in tools</span></div><div><b>Any</b><span>language</span></div><div><b>24/7</b><span>always on</span></div></div>
      </div>
      <DemoChat />
    </section>
  );
}

const chapters = [
  { h: "2 a.m. Your order is MIA.", p: "You message support. The reply: \"We'll get back to you soon.\" Soon is doing a lot of work here." },
  { h: "You're #47 in the queue. Bestie, no.", p: "Hold music on loop. Your call is \"important to us.\"", extra: <div className="queue"><i /></div> },
  { h: "Then Nova pulled up. Vibes restored.", p: "Meet your new support agent. It never sleeps and never puts you on hold. Psst, tap its face. It's ticklish.", mascot: true },
  { h: "Real orders. Real answers.", p: "Nova reads your live order straight from the database. No scripts, no guessing.", extra: <div className="glass mini"><Timeline at={2} /></div> },
  { h: "Policies, not guesses. Humans, when it matters.", p: "Refunds, returns, shipping: answered from your real policies. Can't fix it? Nova opens a ticket for a human.", extra: <div className="stack">{["Refunds", "Returns", "Shipping", "Payments", "Tickets"].map((t) => <span key={t}>{t}</span>)}</div> },
];
function Scene({ p, i, n, c }) {
  const a = i / n, b = (i + 1) / n, f = 0.04;
  const o = useTransform(p, [a - f, a + f, b - f, b + f], [i === 0 ? 1 : 0, 1, 1, i === n - 1 ? 1 : 0]);
  const y = useTransform(p, [a - f, a + f, b - f, b + f], [i === 0 ? 0 : 40, 0, 0, i === n - 1 ? 0 : -40]);
  return <motion.div className="scene" style={{ opacity: o, y }}>{c.mascot && <Mascot size={120} />}<h2>{c.h}</h2><p>{c.p}</p>{c.extra}</motion.div>;
}
function Story() {
  const ref = useRef(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [idx, setIdx] = useState(0);
  useMotionValueEvent(p, "change", (v) => setIdx(Math.min(chapters.length - 1, Math.max(0, Math.floor(v * chapters.length)))));
  return (
    <section id="story" ref={ref} className="story">
      <div className="sticky">
        {chapters.map((c, i) => <Scene key={i} p={p} i={i} n={chapters.length} c={c} />)}
        <div className="steps">{chapters.map((_, i) => <i key={i} className={i === idx ? "on" : ""} />)}</div>
        <div className="scrollhint">Keep scrolling ↓</div>
      </div>
    </section>
  );
}

const stops = [
  { e: "📖", t: "The Story", d: "See why hold music has to go.", h: "#story" },
  { e: "🧠", t: "Nova Lab", d: "Watch the agent think and act.", h: "#features" },
  { e: "🛍️", t: "The Drop", d: "Shop it, then ask Nova about it.", h: "#store" },
  { e: "💬", t: "Talk to Nova", d: "Open the chat and say hi.", act: true },
  { e: "💌", t: "Say hello", d: "Meet the human behind it.", h: "#contact" },
];
function Planet({ s, k, sa, step, rx, active, onPick }) {
  const th = useTransform(sa, (v) => ((v + k * step) * Math.PI) / 180);
  const x = useTransform(th, (t) => Math.sin(t) * rx);
  const y = useTransform(th, (t) => Math.cos(t) * 78);
  const scale = useTransform(th, (t) => 0.6 + 0.4 * ((Math.cos(t) + 1) / 2));
  const opacity = useTransform(th, (t) => 0.4 + 0.6 * ((Math.cos(t) + 1) / 2));
  const zIndex = useTransform(th, (t) => Math.round(Math.cos(t) * 100) + 100);
  return <motion.button className={"planet" + (active ? " on" : "")} style={{ x, y, scale, opacity, zIndex }} onClick={onPick} aria-label={s.t}><span>{s.e}</span><b>{s.t}</b></motion.button>;
}
function Orbit({ onOpen }) {
  const n = stops.length, step = 360 / n;
  const ang = useMotionValue(0);
  const sa = useSpring(ang, { stiffness: 70, damping: 18 });
  const [idx, setIdx] = useState(0);
  const rx = typeof window !== "undefined" && window.innerWidth < 700 ? 135 : 300;
  useMotionValueEvent(sa, "change", (v) => setIdx((((-Math.round(v / step)) % n) + n) % n));
  const rot = (d) => ang.set(Math.round(ang.get() / step) * step + d * step);
  const pick = (k) => { const cur = ang.get(); ang.set(-k * step + 360 * Math.round((cur + k * step) / 360)); };
  const s = stops[idx];
  return (
    <section id="explore" className="wrap sec">
      <SplitText text="Explore in 360°" />
      <p className="sub">Drag the orbit or tap a planet. Nova's whole universe is one spin away.</p>
      <motion.div className="orbitwrap" onPan={(e, info) => ang.set(ang.get() + info.delta.x * 0.4)} onPanEnd={() => ang.set(Math.round(ang.get() / step) * step)}>
        <div className="orbit" style={{ width: rx * 2, marginLeft: -rx }} />
        <div className="core"><Mascot size={150} /></div>
        {stops.map((p, k) => <Planet key={p.t} s={p} k={k} sa={sa} step={step} rx={rx} active={k === idx} onPick={() => pick(k)} />)}
      </motion.div>
      <div className="row ctrl">
        <button className="btn gh" onClick={() => rot(-1)} aria-label="Previous">←</button>
        <div className="rdots">{stops.map((_, k) => <i key={k} className={k === idx ? "on" : ""} />)}</div>
        <button className="btn gh" onClick={() => rot(1)} aria-label="Next">→</button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={idx} className="glass info" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
          <h3>{s.e} {s.t}</h3><p>{s.d}</p>
          {s.act ? <button className="btn pri sm" onClick={onOpen}>Open chat</button> : <a className="btn pri sm" href={s.h}>Take me there</a>}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

const labs = [
  { k: "Track an order", e: "📦", user: "Where's my order ORD1002?", card: <Timeline at={2} />, reply: "It's **out for delivery** and should reach you this evening. Hang tight!",
    steps: [["📥", "Message received", "\"Where's my order ORD1002?\""], ["🧠", "Nova decides", "I need live order data"], ["🔧", "Tool call", "get_order_status('ORD1002')", 1], ["🗄️", "MongoDB returns", "{ status: 'Out for delivery' }", 1], ["💬", "Nova replies", "Plain answer plus a live timeline"]] },
  { k: "Ask a policy", e: "📜", user: "Can I return my headphones?", reply: "Yes, within **7 days** of delivery, unused and in the original packaging. Pickup is free if the item arrived damaged.",
    steps: [["📥", "Message received", "\"Can I return my headphones?\""], ["🧠", "Nova decides", "This is a policy question"], ["🔧", "Tool call", "search_policy('return')", 1], ["🗄️", "Knowledge base returns", "{ title: 'Return Policy', window: '7 days' }", 1], ["💬", "Nova replies", "Answers only from the real policy"]] },
  { k: "Reach a human", e: "🎫", user: "My order arrived damaged. I want a human.", card: <div className="tcard"><Ticket size={18} /><div><b>TKT5041</b><small>Ticket open</small></div></div>, reply: "So sorry about that. I've opened ticket **TKT5041** and a human will reach out soon.",
    steps: [["📥", "Message received", "\"My order arrived damaged...\""], ["🧠", "Nova decides", "Customer needs a human"], ["🔧", "Tool call", "create_ticket(issue, 'ORD1003')", 1], ["🗄️", "MongoDB saves", "{ ticketId: 'TKT5041', status: 'Open' }", 1], ["💬", "Nova replies", "Shares the ticket ID"]] },,
  { k: "Cancel safely", e: "🛑", user: "Please cancel my order ORD1003.", card: <div className="ccard done"><span className="okmark"><Check size={18} /></span><div><b>Order ORD1003 cancelled</b><small>Refund arrives in 3-5 working days</small></div></div>, reply: "Done. Order **ORD1003** is cancelled and your refund will land in **3-5 working days**.",
    steps: [["📥", "Message received", "\"Please cancel my order ORD1003.\""], ["🔧", "Tool call", "cancel_order('ORD1003')", 1], ["🛡️", "Server safety check", "{ status: 'Packed', cancellable: true }", 1], ["👆", "Customer confirms", "Nova can't cancel alone. The customer must press the button."], ["🗄️", "MongoDB updates", "{ status: 'Cancelled' }", 1], ["💬", "Nova replies", "Confirms the cancellation and refund time"]] }
];
function Features() {
  const [i, setI] = useState(0), [n, setN] = useState(0), [rep, setRep] = useState(0);
  const t = labs[i], total = t.steps.length;
  useEffect(() => {
    setN(0);
    const id = setInterval(() => setN((x) => { if (x >= total) { clearInterval(id); return x; } return x + 1; }), 800);
    return () => clearInterval(id);
  }, [i, rep]);
  return (
    <section id="features" className="wrap sec">
      <SplitText text="Welcome to the Nova Lab" />
      <p className="sub">Pick a mission and watch the agent think, call a tool and answer, step by step.</p>
      <div className="glass lab2">
        <div className="missions">{labs.map((x, k) => <button key={x.k} className={k === i ? "on" : ""} onClick={() => setI(k)}><span>{x.e}</span>{x.k}</button>)}</div>
        <div className="lab2-grid">
          <div className="trace">
            <div className="trace-h"><i className="d r" /><i className="d y" /><i className="d g" /><b>agent.trace</b><button onClick={() => setRep((r) => r + 1)}>↻ Replay</button></div>
            <ol>{t.steps.map((s, k) => (
              <li key={i + "-" + k} className={(k < n ? "done" : "") + (k === n - 1 ? " cur" : "")}>
                <span className="ic">{s[0]}</span>
                <div><b>{s[1]}</b><code className={s[3] ? "mono" : ""}>{s[2]}</code></div>
              </li>))}
            </ol>
          </div>
          <div className="out" key={i + "-" + rep}>
            <div className="msg user pop" style={{ "--d": "0s" }}>{t.user}</div>
            {n >= 1 && n < total && <div className="tool pop" style={{ "--d": "0s" }}><span className="spin" />Nova is working...</div>}
            {n >= total && <div className="msg assistant pop" style={{ "--d": "0s" }}><span>{t.reply.split(/(\*\*[^*]+\*\*)/g).map((s, k) => s.startsWith("**") ? <strong key={k}>{s.slice(2, -2)}</strong> : s)}</span>{t.card}</div>}
          </div>
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
    <motion.div className="glass prod" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
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

const navLinks = [{ id: "story", l: "Story", e: "📖" }, { id: "features", l: "Nova Lab", e: "🧠" }, { id: "store", l: "The Drop", e: "🛍️" }, { id: "explore", l: "360°", e: "🪐" }];
function Nav({ count, onCart, onChat }) {
  const ok = useHealth();
  const [active, setActive] = useState(""), [hide, setHide] = useState(false), [small, setSmall] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => { setHide(y > 220 && y > (scrollY.getPrevious() ?? 0)); setSmall(y > 60); });
  useEffect(() => {
    const obs = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach((n) => { const el = document.getElementById(n.id); el && obs.observe(el); });
    return () => obs.disconnect();
  }, []);
  return (
    <motion.nav className={"nav glass" + (small ? " small" : "")} animate={{ y: hide ? -120 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 28 }}>
      <a href="#" className="logo"><Mascot size={36} />Nova<b>Store</b></a>
      <div className="links">
        {navLinks.map((n) => (
          <a key={n.id} href={"#" + n.id} className={active === n.id ? "on" : ""}>
            {active === n.id && <motion.i layoutId="pill" className="pill" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
            <em>{n.e}</em><span>{n.l}</span>
          </a>
        ))}
      </div>
      <div className="row">
        <span className="nstat"><i className={"live" + (ok === false ? " off" : "")} />{ok === false ? "Nova offline" : "Nova online"}</span>
        <button id="cart-btn" className="cart" onClick={onCart} aria-label="Open cart"><ShoppingBag size={19} /><motion.span key={count} initial={{ scale: 1.9 }} animate={{ scale: 1 }} className="badge">{count}</motion.span></button>
        <button className="btn pri sm shine" onClick={onChat}>Talk to Nova</button>
      </div>
    </motion.nav>
  );
}

function Footer() {
  const ok = useHealth();
  const ext = { target: "_blank", rel: "noreferrer" };
  return (
    <footer className="foot" id="contact">
      <div className="glass foot-in">
        <div className="fcol brand">
          <div className="logo"><Mascot size={38} />Nova Store</div>
          <p>Support that actually slaps. An AI agent that tracks orders, knows the policies and files tickets.</p>
          <div className="stack">{["React", "Node.js", "Express", "MongoDB", "Gemini", "RAG"].map((t) => <span key={t}>{t}</span>)}</div>
        </div>
        <div className="fcol"><h4>Explore</h4><a href="#story">Story</a><a href="#features">Nova Lab</a><a href="#store">The Drop</a></div>
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
      <Scene3D />
      <motion.div className="progress" style={{ scaleX: sp }} />
      <Nav count={count} onCart={() => setCartOpen(true)} onChat={() => setOpen(true)} />
      <Hero ask={askNova} />
      <Marquee />
      <Story />
      <Features />
      <section id="store" className="wrap sec">
        <SplitText text="The Drop" />
        <p className="sub">Fresh picks, zero stress. Ask Nova anything before you buy.</p>
        <div className="grid">{products.map((p) => <Prod key={p.name} p={p} onAdd={add} ask={askNova} />)}</div>
      </section>
      <Orbit onOpen={() => setOpen(true)} />
      <Cta onOpen={() => setOpen(true)} />
      <Footer />
      {flies.map((f) => (
        <motion.div key={f.id} className="fly" initial={{ x: f.x, y: f.y, scale: 1, opacity: 1 }} animate={{ x: f.tx, y: [f.y, f.y - 110, f.ty], scale: 0.35, rotate: 360 }} transition={{ duration: 0.85, ease: "easeInOut", times: [0, 0.4, 1] }} onAnimationComplete={() => land(f)}>{f.p.emoji}</motion.div>
      ))}
      <Drawer open={cartOpen} close={() => setCartOpen(false)} items={items} change={bump} total={total} clear={() => setCart({})} ask={askNova} />
      <Chat open={open} setOpen={setOpen} ask={ask} />
    </>
  );
}
