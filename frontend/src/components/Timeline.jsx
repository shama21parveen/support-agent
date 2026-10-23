import { Check } from "lucide-react";
const steps = ["Packed", "Shipped", "Out for delivery", "Delivered"];
export default function Timeline({ at = 1 }) {
  return (
    <div className="tl">
      {steps.map((s, i) => (
        <div key={s} className={i <= at ? "on" : ""} style={{ "--d": i * 0.18 + "s" }}>
          <span>{i <= at ? <Check size={12} /> : null}</span>
          <small>{s}</small>
        </div>
      ))}
    </div>
  );
}
