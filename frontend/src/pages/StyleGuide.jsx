// StyleGuide.jsx — living reference for the LeakLens design system.
// Temporary landing page until the dashboard is rebuilt on these tokens.
// Every colour/type/component decision is demonstrated here once.

import Card, { CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

const SURFACES = [
  ["--background", "App background", "bg-background"],
  ["--surface", "Card panel", "bg-surface"],
  ["--surface-elevated", "Raised panel / inputs", "bg-surface-elevated"],
  ["--surface-hover", "Hover state", "bg-surface-hover"],
];

const TEXT = [
  ["--text-primary", "bg-background text-text-primary"],
  ["--text-secondary", "bg-surface text-text-secondary"],
  ["--text-muted", "bg-surface-elevated text-text-muted"],
];

const ACCENT = [
  ["--accent", "bg-accent"],
  ["--accent-strong", "bg-accent-strong"],
  ["--success", "bg-success"],
  ["--warning", "bg-warning"],
  ["--danger", "bg-danger"],
];

function Swatch({ name, label, className }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`h-9 w-9 shrink-0 rounded-md border border-border ${className}`} />
      <div className="min-w-0">
        <p className="text-small font-medium text-text-primary">{label}</p>
        <code className="text-caption text-text-muted">{name}</code>
      </div>
    </div>
  );
}

export default function StyleGuide() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 lg:px-8">
      {/* Masthead */}
      <header>
        <p className="overline">LeakLens Design System · v1</p>
        <h1 className="mt-1 text-heading text-text-primary">
          Visual foundation
        </h1>
        <p className="mt-1 max-w-2xl text-body text-text-secondary">
          Dark-first financial intelligence theme. One accent, neutral
          everything else, colour reserved for severity. This page is the
          living reference the dashboard will be built on.
        </p>
      </header>

      {/* Type scale */}
      <Card>
        <CardHeader title="Typography" subtitle="Six levels, tabular figures for money" />
        <div className="flex flex-col gap-3 px-5 py-5">
          <p className="text-display text-text-primary">Display 32 · ₹25.4M</p>
          <p className="text-heading text-text-primary">Heading 22 — Section titles</p>
          <p className="text-section text-text-primary">Section 16 — Card titles</p>
          <p className="text-body text-text-secondary">
            Body 14 — primary reading text for descriptions and explanations.
          </p>
          <p className="text-small text-text-secondary">Small 13 — table cells and dense UI.</p>
          <p className="overline">Caption 11 — OVERLINE LABELS</p>
          <p className="tnum text-display text-text-primary">
            1234567.89 <span className="text-body text-text-muted">— .tnum: mono, tabular, for financial figures</span>
          </p>
        </div>
      </Card>

      {/* Colours */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Surfaces" subtitle="Background → elevated" />
          <div className="flex flex-col gap-3 px-5 py-5">
            {SURFACES.map(([name, label, cls]) => (
              <Swatch key={name} name={name} label={label} className={cls} />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Text" subtitle="Three contrast levels" />
          <div className="flex flex-col gap-3 px-5 py-5">
            {TEXT.map(([name, cls]) => (
              <Swatch key={name} name={name} label={name} className={cls} />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Accent & status" subtitle="One accent, meaningful colour only" />
          <div className="flex flex-col gap-3 px-5 py-5">
            {ACCENT.map(([name, cls]) => (
              <Swatch key={name} name={name} label={name} className={cls} />
            ))}
          </div>
        </Card>
      </div>

      {/* Components */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Buttons" subtitle="primary · secondary · ghost · danger" />
          <div className="flex flex-wrap items-center gap-3 px-5 py-5">
            <Button variant="primary">Primary action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Badges" subtitle="Severity ladder + neutral/accent" />
          <div className="flex flex-wrap items-center gap-3 px-5 py-5">
            <Badge variant="LOW" dot>LOW</Badge>
            <Badge variant="MEDIUM" dot>MEDIUM</Badge>
            <Badge variant="HIGH" dot>HIGH</Badge>
            <Badge variant="neutral">Clean</Badge>
            <Badge variant="accent">Price Anomaly</Badge>
          </div>
        </Card>
      </div>

      {/* Cards sample */}
      <Card hover>
        <CardHeader
          title="Card · hover state"
          subtitle="Rounded-card radius, subtle border, restrained shadow"
          action={<Button variant="ghost" size="sm">View all →</Button>}
        />
        <div className="px-5 py-5 text-body text-text-secondary">
          This is the base panel every dashboard section will use — hover it to
          see the border lift. Padding: 20px inline, 16–20px block, 12px header gap.
        </div>
      </Card>

      <p className="text-caption text-text-muted">
        LeakLens · FINATHON 2026 · FIN-04 — foundation milestone
      </p>
    </div>
  );
}
