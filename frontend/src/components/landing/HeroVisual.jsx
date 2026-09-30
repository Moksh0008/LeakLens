// HeroVisual.jsx — the hero's product visual: a miniature LeakLens dashboard
// assembled from the REAL design-system components (Card, Badge) and mock
// procurement figures, so the product is understood within seconds.
// Purely illustrative — not live data.

import { motion, useReducedMotion } from "framer-motion";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { TrendUpIcon } from "../ui/Icons";
import { CountUp } from "./motion";

const EASE = [0.22, 1, 0.36, 1];

/** Tiny bar sparkline built from divs — no chart lib needed at this size. */
function MiniBars({ data, height = 44 }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((v, i) => (
        <motion.span
          key={i}
          className="flex-1 rounded-sm bg-accent/70"
          initial={{ scaleY: reduce ? 1 : 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.5 + i * 0.07, ease: EASE }}
          style={{ height: `${v}%`, transformOrigin: "bottom" }}
        />
      ))}
    </div>
  );
}

const FINDINGS = [
  { id: "TX1045", label: "Laptop · ABC Ltd", amount: "₹300,000", severity: "HIGH" },
  { id: "TX1021", label: "Office Chair · Comfort Supplies", amount: "₹37,500", severity: "MEDIUM" },
  { id: "TX1109", label: "Steel Sheet · Meridian", amount: "₹18,200", severity: "LOW" },
];

export default function HeroVisual() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24, scale: reduce ? 1 : 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduce ? 0.2 : 0.7, ease: EASE, delay: 0.25 }}
      className="relative w-full max-w-[540px]"
      aria-label="Illustrative LeakLens dashboard preview"
    >
      {/* Main panel */}
      <Card className="overflow-hidden">
        {/* Mock window chrome */}
        <div className="flex items-center justify-between border-b border-border bg-surface-elevated/60 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
          </div>
          <span className="text-caption text-text-muted">LeakLens · Spend Analysis</span>
          <Badge variant="accent">LIVE SCAN</Badge>
        </div>

        <div className="flex flex-col gap-4 p-4">
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Procurement Spend", value: 12500000, format: (v) => `₹${(v / 1e6).toFixed(1)}M`, cls: "text-text-primary" },
              { label: "Potential Leakage", value: 1840000, format: (v) => `₹${(v / 1e6).toFixed(2)}M`, cls: "text-danger" },
              { label: "Missed Savings", value: 620000, format: (v) => `₹${(v / 1e3).toFixed(0)}K`, cls: "text-warning" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-control border border-border bg-surface-elevated/50 p-3">
                <p className="overline">{kpi.label}</p>
                <p className={`tnum mt-1.5 text-[19px] font-semibold leading-none ${kpi.cls}`}>
                  <CountUp value={kpi.value} format={kpi.format} duration={1.6} />
                </p>
              </div>
            ))}
          </div>

          {/* Trend + findings split */}
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3 rounded-control border border-border bg-surface-elevated/50 p-3">
              <div className="flex items-center justify-between">
                <p className="overline">Leakage by month</p>
                <TrendUpIcon size={14} className="text-danger" />
              </div>
              <div className="mt-2">
                <MiniBars data={[35, 55, 42, 70, 58, 88, 64, 95]} />
              </div>
              <div className="mt-1.5 flex justify-between text-caption text-text-muted">
                <span>Feb</span><span>Sep</span>
              </div>
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              {FINDINGS.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: reduce ? 0 : 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduce ? 0 : 0.9 + i * 0.15, duration: 0.4, ease: EASE }}
                  className="rounded-control border border-border bg-surface-elevated/50 px-2.5 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="tnum text-caption text-text-secondary">{f.id}</span>
                    <Badge variant={f.severity}>{f.severity}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-caption text-text-muted">{f.label}</p>
                  <p className="tnum text-small font-semibold text-text-primary">{f.amount}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Floating accuracy chip */}
      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduce ? 0 : 1.3, duration: 0.5, ease: EASE }}
        className="absolute -bottom-4 -left-3 rounded-card border border-border bg-surface-elevated px-3.5 py-2.5 shadow-[var(--shadow-pop)]"
      >
        <p className="overline">Benchmarks compared</p>
        <p className="tnum text-small font-semibold text-text-primary">
          <CountUp value={12486} format={(v) => Math.round(v).toLocaleString("en-IN")} /> transactions
        </p>
      </motion.div>
    </motion.div>
  );
}
