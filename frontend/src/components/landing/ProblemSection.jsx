// ProblemSection.jsx — why leakage is hard to see:
// single transactions look normal; patterns across suppliers, products,
// prices and contracts reveal avoidable spend.

import { Reveal, Stagger, StaggerItem } from "./motion";
import Card from "../ui/Card";

const PROBLEMS = [
  {
    title: "Price Variance",
    body: "Same or similar products purchased at significantly different prices across teams, regions or time.",
    stat: "2.4×",
    statLabel: "price gap between the lowest and highest paid for one SKU",
  },
  {
    title: "Missed Discounts",
    body: "Actual purchase prices exceed negotiated or expected prices — agreed terms left on the table.",
    stat: "₹620K",
    statLabel: "potential missed savings in the illustrative dataset",
  },
  {
    title: "Fragmented Purchasing",
    body: "Similar purchases are spread across multiple suppliers, forfeiting volume leverage and visibility.",
    stat: "3×",
    statLabel: "suppliers used for comparable items in one category",
  },
  {
    title: "Contract Exceptions",
    body: "Purchases occur outside expected contractual terms — off-contract buys slip through unnoticed.",
    stat: "12%",
    statLabel: "of illustrative transactions sit outside contracted terms",
  },
];

export default function ProblemSection() {
  return (
    <section id="product" className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal className="max-w-2xl">
          <p className="overline">The Problem</p>
          <h2 className="mt-2 text-heading text-text-primary">
            Procurement leakage rarely appears in a single transaction.
          </h2>
          <p className="mt-3 text-body text-text-secondary">
            Each purchase can look justified in isolation. The signal emerges
            when transactions are compared across suppliers, products, prices
            and contracts — patterns no spreadsheet review catches at scale.
          </p>
        </Reveal>

        <Stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" gap={0.09}>
          {PROBLEMS.map((p) => (
            <StaggerItem key={p.title} className="h-full">
              <Card hover className="flex h-full flex-col p-5">
                <p className="tnum text-display text-text-primary">{p.stat}</p>
                <p className="overline mt-1">{p.title}</p>
                <p className="mt-3 flex-1 text-small text-text-secondary">{p.body}</p>
                <p className="mt-4 border-t border-border/70 pt-3 text-caption text-text-muted">
                  {p.statLabel}
                </p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
