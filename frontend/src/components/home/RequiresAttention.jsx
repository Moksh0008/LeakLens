// RequiresAttention.jsx — investigation priority panel.
// Neutral terminology only: Potential Excess Cost, Missed Discount,
// Out-of-Contract Purchase. Never "fraud" or "confirmed loss".

import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { formatCompactINR } from "../../utils/format";
import { SeverityBadge } from "../ui/Badges";

export default function RequiresAttention({ items }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col divide-y divide-border">
      {items.map((item, i) => (
        <motion.div
          key={item.issue + item.product}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: reduce ? 0 : 0.1 + i * 0.06 }}
          className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-small font-medium text-text-primary">{item.issue}</p>
            <SeverityBadge severity={item.severity} />
          </div>
          <p className="text-caption text-text-muted">
            {item.product} — {item.evidence}
          </p>
          <p className="text-caption">
            <span className="text-text-muted">Potential impact: </span>
            <span className="tnum font-medium text-text-primary">
              {formatCompactINR(item.impact)}
            </span>
          </p>
        </motion.div>
      ))}

      <div className="pt-4">
        <Link
          to="/leakage"
          className="text-small font-medium text-accent transition-colors hover:text-accent-strong"
        >
          View Leakage Analysis →
        </Link>
      </div>
    </div>
  );
}
