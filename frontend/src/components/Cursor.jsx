import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

function Trail({ x, y, i, big }) {
  const sx = useSpring(x, { stiffness: 520 - i * 90, damping: 30 });
  const sy = useSpring(y, { stiffness: 520 - i * 90, damping: 30 });
  const s = i === 0 ? 20 : 16 - i * 2.5;
  return <motion.div className={"cur " + (i === 0 ? "head" : "tail")} style={{ x: sx, y: sy, width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2, opacity: i === 0 ? 1 : 0.55 - i * 0.1 }} animate={{ scale: i === 0 && big ? 1.9 : 1 }} />;
}

export default function Cursor() {
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const [big, setBig] = useState(false), [on, setOn] = useState(false);
  useEffect(() => {
    if (!matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    setOn(true);
    const m = (e) => { x.set(e.clientX); y.set(e.clientY); setBig(!!e.target.closest?.("a,button,input,textarea,label,.prod")); };
    addEventListener("mousemove", m);
    return () => removeEventListener("mousemove", m);
  }, []);
  if (!on) return null;
  return <>{[4, 3, 2, 1, 0].map((i) => <Trail key={i} x={x} y={y} i={i} big={big} />)}</>;
}
