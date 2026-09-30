// ManagementInsights.jsx — what leadership sees: portfolio-level metrics
// and the spend-vs-leakage picture. All figures are illustrative demo
// values, clearly labelled as such.

import { Reveal, Stagger, StaggerItem, CountUp } from "./motion";
import Card, { CardHeader } from "../ui/Card";

const METRICS = [
  { label: "Procurement Spend", value: 12500000, format: (v) => `₹${(v / 1e6).toFixed(1)}M`, cls: "text-text-primary" },
  { label: "Potential Leakage", value: 1840000, format: (v) => `₹${(v / 1e6).toFixed(2)}M`, cls: "text-danger" },
  { label: "Potential Missed Savings", value: 620000, format: (v) => `₹${(v / 1e3).toFixed(0)}K`, cls: "text-warning" },
  { label: "Transactions Requiring Investigation", value: 147, format: (v) => Math.round(v).toLocaleString("en-IN"), cls: "text-text-primary" },
];

/** Stacked comparison: spend vs leakage, plus leakage-rate caption. */
function SpendVsLeakage() {
  const leakage = 1.84;
  const spend = 12.5;
  const pct = ((leakage / spend) * 100).toFixed(1);

  return (
    <div className="flex h-full flex-col justify-center gap-4 p-5">
      <div>
        <div className="flex items-baseline justify-between">
          <p className="overline">Spend vs Potential Leakage</p>
          <p className="tnum text-caption text-text-muted">{pct}% of spend</p>
        </div>
        {/* Spend bar */}
        <div className="mt-3 flex items-center gap-3">
          <span className="w-24 shrink-0 text-small text-text-secondary">Spend</span>
          <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-surface-elevated">
            <div className="h-full w-full rounded-full bg-accent/80" />
          </div>
          <span className="tnum w-16 text-right text-small text-text-primary">₹12.5M</span>
        </div>
        {/* Leakage bar — scale exaggerated ×5 so it is visible; labelled */}
        <div className="mt-2.5 flex items-center gap-3">
          <span className="w-24 shrink-0 text-small text-text-secondary">Leakage</span>
          <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-surface-elevated">
            <div className="h-full w-[14.7%] rounded-full bg-danger" title="shown at 5× scale for visibility" />
          </div>
          <span className="tnum w-16 text-right text-small text-danger">₹1.84M</span>
        </div>
        <p className="mt-3 text-caption text-text-muted">
          Leakage bar shown at 5× scale for visibility.
        </p>
      </div>
    </div>
  );
}

export default function ManagementInsights() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal className="max-w-2xl">
          <p className="overline">Management Insights</p>
          <h2 className="mt-2 text-heading text-text-primary">
            The procurement picture, in four numbers.
          </h2>
          <p className="mt-3 text-body text-text-secondary">
            LeakLens translates thousands of transactions into the figures a
            leadership team can act on — exposure, opportunity, and where to
            look first.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* KPI grid (2/3) */}
          <Stagger className="grid grid-cols-2 gap-4 lg:col-span-2" gap={0.08}>
            {METRICS.map((m) => (
              <StaggerItem key={m.label} className="h-full">
                <Card className="flex h-full flex-col justify-between p-5">
                  <p className="overline">{m.label}</p>
                  <p className={`tnum mt-4 text-display font-semibold leading-none ${m.cls}`}>
                    <CountUp value={m.value} format={m.format} duration={1.5} />
                  </p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>

          {/* Comparison visual (1/3) */}
          <Reveal delay={0.15} className="h-full">
            <Card className="h-full">
              <CardHeader title="Spend vs Potential Leakage" subtitle="Illustrative dataset" />
              <SpendVsLeakage />
            </Card>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <p className="mt-4 text-caption text-text-muted">
            Figures shown are illustrative demo values for product demonstration — not real company data.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
