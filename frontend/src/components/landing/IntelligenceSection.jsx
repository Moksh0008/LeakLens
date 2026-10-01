// IntelligenceSection.jsx — the four core analysis capabilities.
// Each card carries a small illustrative visualization so the capability
// is understood at a glance, not just described.

import { Reveal, Stagger, StaggerItem } from "./motion";
import Card from "../ui/Card";

/** Two bars showing actual vs benchmark — the essence of benchmarking. */
function CompareMini() {
  return (
    <div className="mt-4 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="w-14 text-caption text-text-muted">Actual</span>
        <span className="h-2 flex-1 rounded-full bg-danger/70" style={{ maxWidth: "86%" }} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-14 text-caption text-text-muted">Benchmark</span>
        <span className="h-2 flex-1 rounded-full bg-accent/70" style={{ maxWidth: "58%" }} />
      </div>
    </div>
  );
}

/** Supplier scatter suggestion: dots of varying spread. */
function SuppliersMini() {
  return (
    <div className="mt-4 flex h-9 items-end justify-between gap-2">
      {[65, 30, 80, 22, 55, 38, 72, 18].map((h, i) => (
        <span
          key={i}
          className="w-2 rounded-full bg-accent/50"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

/** Contract line with a breach point. */
function ContractMini() {
  return (
    <div className="mt-4 flex items-center gap-1">
      <span className="h-px flex-1 bg-border-strong" />
      <span className="h-2.5 w-2.5 rounded-full bg-warning" />
      <span className="h-px flex-1 bg-border-strong" />
    </div>
  );
}

/** Pattern dots: one outlier among many. */
function PatternMini() {
  return (
    <div className="mt-4 flex items-center gap-1.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i === 7 ? "bg-danger" : "bg-accent/40"}`}
        />
      ))}
      <span className="tnum ml-auto text-caption text-text-muted">+4.8σ</span>
    </div>
  );
}

const CAPABILITIES = [
  {
    title: "Price Benchmarking",
    body: "Compare similar products and identify abnormal price differences against historical benchmarks.",
    visual: <CompareMini />,
  },
  {
    title: "Supplier Analysis",
    body: "Identify fragmented purchasing and supplier overlap across categories and regions.",
    visual: <SuppliersMini />,
  },
  {
    title: "Contract & Discount Analysis",
    body: "Compare actual purchases against negotiated terms and expected discount structures.",
    visual: <ContractMini />,
  },
  {
    title: "Leakage Detection",
    body: "Surface unusual procurement patterns and potential avoidable expenditure with statistical evidence.",
    visual: <PatternMini />,
  },
];

export default function IntelligenceSection() {
  return (
    <section id="insights" className="border-t border-border/60">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal className="max-w-2xl">
          <p className="overline">Core Intelligence</p>
          <h2 className="mt-2 text-heading text-text-primary">
            Four lenses on every transaction.
          </h2>
        </Reveal>

        <Stagger className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2" gap={0.09}>
          {CAPABILITIES.map((c) => (
            <StaggerItem key={c.title} className="h-full">
              <Card hover className="h-full p-5">
                <h3 className="text-section font-semibold text-text-primary">{c.title}</h3>
                <p className="mt-2 max-w-md text-small text-text-secondary">{c.body}</p>
                <div className="border-t border-border/70 pt-1">{c.visual}</div>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
