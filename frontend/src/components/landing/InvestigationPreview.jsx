// InvestigationPreview.jsx — proof that LeakLens shows its work:
// a realistic finding card with the transaction evidence behind the number.

import { Reveal, Stagger, StaggerItem } from "./motion";
import Card, { CardHeader } from "../ui/Card";
import Badge from "../ui/Badge";

const EVIDENCE = [
  { label: "Actual Price", value: "₹65,000", tone: "text-danger" },
  { label: "Benchmark", value: "₹50,000", tone: "text-text-primary" },
  { label: "Quantity", value: "20", tone: "text-text-primary" },
  { label: "Potential Impact", value: "₹300,000", tone: "text-danger font-semibold" },
];

export default function InvestigationPreview() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        {/* Copy */}
        <Reveal className="order-2 max-w-xl lg:order-1">
          <p className="overline">Investigation</p>
          <h2 className="mt-2 text-heading text-text-primary">
            Every number comes with its evidence.
          </h2>
          <p className="mt-3 text-body text-text-secondary">
            LeakLens does not just surface a figure. Each potential finding
            carries the transaction behind it — actual vs benchmark pricing,
            quantity, impact math and severity — so procurement teams can
            verify, investigate and act with confidence.
          </p>
          <ul className="mt-6 flex flex-col gap-2.5">
            {[
              "Transaction-level price evidence",
              "Benchmark comparison with impact calculation",
              "Severity classification for triage",
            ].map((li) => (
              <li key={li} className="flex items-center gap-2.5 text-small text-text-secondary">
                <span className="h-1 w-1 rounded-full bg-accent" />
                {li}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Finding card */}
        <Reveal delay={0.12} className="order-1 lg:order-2">
          <Card className="mx-auto w-full max-w-md">
            <CardHeader
              title={<>Transaction <span className="tnum">TX1045</span></>}
              subtitle="Laptop · ABC Ltd"
              action={<Badge variant="HIGH" dot>HIGH</Badge>}
            />
            <div className="flex flex-col gap-4 p-5">
              <Stagger className="grid grid-cols-2 gap-3" gap={0.07}>
                {EVIDENCE.map((e) => (
                  <StaggerItem key={e.label}>
                    <div className="rounded-control border border-border bg-surface-elevated/50 p-3">
                      <p className="overline">{e.label}</p>
                      <p className={`tnum mt-1 text-[17px] ${e.tone}`}>{e.value}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>

              {/* Impact math */}
              <div className="rounded-control border border-border bg-surface-elevated/40 px-4 py-3">
                <p className="tnum text-small text-text-secondary">
                  <span className="text-danger">₹65,000</span>
                  <span className="text-text-muted"> actual − </span>
                  ₹50,000<span className="text-text-muted"> benchmark = </span>
                  ₹15,000<span className="text-text-muted"> × 20 units = </span>
                  <span className="font-semibold text-danger">₹300,000</span>
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border/70 pt-3">
                <div className="flex items-center gap-2">
                  <span className="overline">Status</span>
                  <Badge variant="accent">Requires Investigation</Badge>
                </div>
                <span className="text-caption text-text-muted">Detected · PRICE_ANOMALY</span>
              </div>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
