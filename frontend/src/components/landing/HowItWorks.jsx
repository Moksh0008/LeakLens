// HowItWorks.jsx — the pipeline in four steps.
// Horizontal with connector arrows on desktop, vertical timeline on mobile.

import { Reveal, Stagger, StaggerItem } from "./motion";
import Card from "../ui/Card";

const STEPS = [
  {
    n: "01",
    title: "Import",
    body: "Historical procurement transactions are consolidated from spreadsheets and systems into one dataset.",
  },
  {
    n: "02",
    title: "Normalize",
    body: "Suppliers and products are standardized and matched so prices can be compared like-for-like.",
  },
  {
    n: "03",
    title: "Analyze",
    body: "Prices, contracts, suppliers and purchasing patterns are evaluated against benchmarks.",
  },
  {
    n: "04",
    title: "Investigate",
    body: "Potential leakage and savings opportunities are surfaced with transaction-level evidence.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal className="max-w-2xl">
          <p className="overline">How LeakLens Works</p>
          <h2 className="mt-2 text-heading text-text-primary">
            From raw transactions to investigated findings.
          </h2>
        </Reveal>

        <Stagger className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4" gap={0.1}>
          {STEPS.map((s, i) => (
            <StaggerItem key={s.n} className="relative h-full">
              {/* Connector (desktop): arrow between cards */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-text-muted md:block"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </span>
              )}
              <Card hover className="flex h-full flex-col p-5">
                <span className="tnum text-caption font-semibold text-accent">{s.n}</span>
                <h3 className="mt-2 text-section font-semibold text-text-primary">{s.title}</h3>
                <p className="mt-2 text-small text-text-secondary">{s.body}</p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
