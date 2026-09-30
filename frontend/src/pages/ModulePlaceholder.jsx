// ModulePlaceholder.jsx — shared placeholder for planned analysis modules
// (Price Benchmarking, Supplier Analysis, Contracts & Discounts, Leakage
// Analysis). Keeps the sidebar fully navigable before each module ships;
// each gets its own real page later.

import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

const MODULES = {
  "price-benchmarking": {
    title: "Price Benchmarking",
    overline: "Analysis module",
    blurb:
      "Compare unit prices paid against historical benchmarks and across suppliers to expose abnormal price differences.",
    planned: [
      "Product-level benchmark table with variance",
      "Price trend per product and supplier",
      "Top outlier transactions with evidence links",
    ],
  },
  "supplier-analysis": {
    title: "Supplier Analysis",
    overline: "Analysis module",
    blurb:
      "Understand spend concentration, supplier overlap and fragmentation across categories and regions.",
    planned: [
      "Supplier spend ranking and share of wallet",
      "Fragmented purchasing heat by category",
      "Consolidation candidates with estimated savings",
    ],
  },
  contracts: {
    title: "Contracts & Discounts",
    overline: "Analysis module",
    blurb:
      "Compare actual purchases against negotiated terms to surface out-of-contract buys and missed discounts.",
    planned: [
      "Contract coverage overview",
      "Out-of-contract transaction list",
      "Missed discount recovery estimates",
    ],
  },
  leakage: {
    title: "Leakage Analysis",
    overline: "Analysis module",
    blurb:
      "Deep-dive into every leakage pattern: price anomalies, spikes, duplicates, unusual quantities and patterns.",
    planned: [
      "Pattern breakdown by detection type",
      "Severity triage workflow",
      "Investigation queue with status tracking",
    ],
  },
};

export default function ModulePlaceholder({ moduleKey }) {
  const mod = MODULES[moduleKey] || Object.values(MODULES)[0];
  const reduce = useReducedMotion();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0.2 : 0.4, ease: "easeOut" }}
      >
        <p className="overline">{mod.overline}</p>
        <h2 className="mt-1.5 text-heading text-text-primary">{mod.title}</h2>
        <p className="mt-2 max-w-xl text-body text-text-secondary">{mod.blurb}</p>
      </motion.div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-section font-semibold text-text-primary">Planned scope</p>
          <Badge variant="accent">in design</Badge>
        </div>
        <ul className="mt-4 flex flex-col gap-2.5">
          {mod.planned.map((p, i) => (
            <motion.li
              key={p}
              initial={{ opacity: 0, x: reduce ? 0 : -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduce ? 0 : 0.15 + i * 0.08, duration: 0.3 }}
              className="flex items-start gap-2.5 text-small text-text-secondary"
            >
              <span className="tnum mt-0.5 text-caption text-text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              {p}
            </motion.li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
          <Link to="/dashboard">
            <Button variant="secondary" size="sm">← Back to overview</Button>
          </Link>
          <Link to="/upload">
            <Button variant="primary" size="sm">Import data instead</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
