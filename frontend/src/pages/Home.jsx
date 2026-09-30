// Home.jsx — authenticated landing page (/home).
// Calmer and simpler than /dashboard: orients the user, surfaces what
// matters, and points to next actions. Composes isolated sections from
// components/home/*; mock content lives in components/home/homeData.js.

import SectionCard from "../components/dashboard/SectionCard";
import QuickSnapshot from "../components/home/QuickSnapshot";
import PrimaryActions from "../components/home/PrimaryActions";
import IdentifyFeatures from "../components/home/IdentifyFeatures";
import RecentActivity from "../components/home/RecentActivity";
import RequiresAttention from "../components/home/RequiresAttention";
import ExploreLinks from "../components/home/ExploreLinks";
import { motion, useReducedMotion } from "framer-motion";
import {
  EXPLORE_LINKS,
  HOME_USER,
  IDENTIFY_FEATURES,
  PERIOD_LABEL,
  RECENT_ACTIVITY,
  REQUIRES_ATTENTION,
  SNAPSHOT,
  greetingForHour,
} from "../components/home/homeData";

export default function Home() {
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting + period indicator */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h2 className="text-heading font-semibold text-text-primary">
            {greetingForHour()}, {HOME_USER.name}
          </h2>
          <p className="mt-1.5 text-body text-text-secondary">
            Here&apos;s a quick view of your procurement intelligence workspace.
          </p>
        </div>
        <span className="tnum rounded-control border border-border bg-surface px-3.5 py-2 text-caption text-text-secondary">
          {PERIOD_LABEL}
        </span>
      </motion.div>

      {/* Section 1 — quick snapshot */}
      <section aria-label="Quick snapshot" className="flex flex-col gap-5">
        <h3 className="text-section font-semibold text-text-primary">Quick Snapshot</h3>
        <QuickSnapshot items={SNAPSHOT} />
      </section>

      {/* Section 2 — primary actions */}
      <PrimaryActions />

      {/* Section 3 — what LeakLens can identify */}
      <section aria-label="What LeakLens can identify" className="flex flex-col gap-5">
        <h3 className="text-section font-semibold text-text-primary">
          What LeakLens Can Identify
        </h3>
        <IdentifyFeatures items={IDENTIFY_FEATURES} />
      </section>

      {/* Sections 4 + 5 — activity and attention, two columns on desktop */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <SectionCard
          title="Recent Procurement Activity"
          subtitle="Latest analyzed transactions and findings"
        >
          <RecentActivity items={RECENT_ACTIVITY} />
        </SectionCard>

        <SectionCard
          title="Requires Attention"
          subtitle="Highest-priority potential findings"
        >
          <RequiresAttention items={REQUIRES_ATTENTION} />
        </SectionCard>
      </div>

      {/* Section 6 — navigation entry points */}
      <div className="rounded-card border border-border bg-surface p-6">
        <ExploreLinks links={EXPLORE_LINKS} />
      </div>

      <p className="text-caption text-text-muted">
        Illustrative demo data — not real company figures.
      </p>
    </div>
  );
}
