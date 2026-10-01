// Home.jsx — authenticated landing page (/home).
// Calmer and simpler than /dashboard: orients the user, surfaces what
// matters, and points to next actions. Composes isolated sections from
// components/home/*.
//
// Data flow: snapshot / recent activity / requires attention go through
// services/api.js like every other page. Mock mode renders the demo
// constants as-is; real mode derives the same shapes from the live
// backend, falling back to the demo constants if the backend is
// unreachable or the workspace is still empty (so the page never breaks).

import { useEffect, useState } from "react";
import SectionCard from "../components/dashboard/SectionCard";
import EmptyWorkspace from "../components/EmptyWorkspace";
import QuickSnapshot from "../components/home/QuickSnapshot";
import PrimaryActions from "../components/home/PrimaryActions";
import IdentifyFeatures from "../components/home/IdentifyFeatures";
import RecentActivity from "../components/home/RecentActivity";
import RequiresAttention from "../components/home/RequiresAttention";
import ExploreLinks from "../components/home/ExploreLinks";
import { motion, useReducedMotion } from "framer-motion";
import { getDashboard, getTransactions } from "../services/api";
import { getStoredSession } from "../services/auth";
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

// Demo constants are final in mock mode; real mode derives from the API.
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

/** First name of the signed-in user (real session) or the demo persona. */
function displayName() {
  try {
    const user = JSON.parse(localStorage.getItem("leaklens.user") || "null");
    const first = user?.fullName?.trim().split(/\s+/)[0];
    if (first) return first;
  } catch {
    /* ignore malformed user records */
  }
  return HOME_USER.name;
}

/** Build the same shapes homeData exports from live API results. */
function deriveSections(dashboard, transactions) {
  const flagged = transactions.filter(
    (t) => t.potentialLeakage > 0 && t.detectionType !== "NONE",
  );
  const highCount = flagged.filter((t) => t.severity === "HIGH").length;

  const snapshot = [
    {
      label: "Total Procurement Spend",
      value: dashboard.totalProcurement ?? 0,
      context: `${dashboard.transactionsAnalyzed ?? transactions.length} transactions analyzed`,
      format: "compactINR",
    },
    {
      label: "Potential Leakage",
      value: dashboard.potentialLeakage ?? 0,
      context: "of analyzed spend",
      emphasis: true,
      format: "compactINR",
    },
    {
      label: "Potential Missed Savings",
      value: dashboard.missedSavings ?? 0,
      context: "recoverable via negotiation",
      format: "compactINR",
    },
    {
      label: "Transactions Requiring Investigation",
      value: dashboard.flaggedTransactions ?? flagged.length,
      context: `${highCount} high-severity findings`,
      format: "number",
    },
  ];

  const recentActivity = flagged.slice(0, 4).map((t) => ({
    transactionId: t.transactionId,
    product: t.product,
    supplier: t.supplier,
    amount: t.totalAmount,
    finding: t.detectionType,
    severity: t.severity,
  }));

  const requiresAttention = [...flagged]
    .sort((a, b) => (b.potentialLeakage ?? 0) - (a.potentialLeakage ?? 0))
    .slice(0, 3)
    .map((t) => ({
      issue: t.reason?.split("—")[0]?.trim() || t.detectionType,
      product: t.product,
      evidence: t.reason || `${t.detectionType} detected by the engine`,
      impact: t.potentialLeakage,
      severity: t.severity,
    }));

  return { snapshot, recentActivity, requiresAttention };
}

export default function Home() {
  const reduce = useReducedMotion();
  const [snapshot, setSnapshot] = useState(SNAPSHOT);
  const [recentActivity, setRecentActivity] = useState(RECENT_ACTIVITY);
  const [requiresAttention, setRequiresAttention] = useState(REQUIRES_ATTENTION);
  const [usingRealData, setUsingRealData] = useState(false);
  const [workspaceEmpty, setWorkspaceEmpty] = useState(false);
  // Mock mode has no persistence — remember per-account whether a CSV
  // was uploaded so a fresh login sees an empty workspace too.
  const [mockHasData] = useState(
    () => localStorage.getItem("leaklens.hasData") === "1",
  );

  useEffect(() => {
    if (USE_MOCK) return undefined; // demo constants are the final state

    let cancelled = false;

    async function load() {
      try {
        const [dashboard, transactions] = await Promise.all([
          getDashboard(),
          getTransactions(),
        ]);
        if (cancelled) return;

        if (transactions.length > 0) {
          const derived = deriveSections(dashboard, transactions);
          setSnapshot(derived.snapshot);
          setRecentActivity(derived.recentActivity);
          setRequiresAttention(derived.requiresAttention);
          setUsingRealData(true);
        } else {
          // Fresh account — nothing imported yet.
          setWorkspaceEmpty(true);
        }
      } catch {
        // Backend unreachable or database not seeded yet — a new account
        // has nothing to show regardless.
        setWorkspaceEmpty(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fresh account — no content, just the upload prompt.
  // (Real mode: no rows in the database. Mock mode: nothing uploaded yet.)
  if (workspaceEmpty || (USE_MOCK && !mockHasData)) {
    return (
      <div className="flex flex-col gap-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <h2 className="text-heading font-semibold text-text-primary">
              {greetingForHour()}, {displayName()}
            </h2>
            <p className="mt-1.5 text-body text-text-secondary">
              Here's a quick view of your procurement intelligence workspace.
            </p>
          </div>
          <span className="tnum rounded-control border border-border bg-surface px-3.5 py-2 text-caption text-text-secondary">
            Workspace · 0 transactions
          </span>
        </motion.div>

        <EmptyWorkspace />
      </div>
    );
  }

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
            {greetingForHour()}, {displayName()}
          </h2>
          <p className="mt-1.5 text-body text-text-secondary">
            Here&apos;s a quick view of your procurement intelligence workspace.
          </p>
        </div>
        <span className="tnum rounded-control border border-border bg-surface px-3.5 py-2 text-caption text-text-secondary">
          {usingRealData ? "Live · backend connected" : PERIOD_LABEL}
        </span>
      </motion.div>

      {/* Section 1 — quick snapshot */}
      <section aria-label="Quick snapshot" className="flex flex-col gap-5">
        <h3 className="text-section font-semibold text-text-primary">Quick Snapshot</h3>
        <QuickSnapshot items={snapshot} />
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
          <RecentActivity items={recentActivity} />
        </SectionCard>

        <SectionCard
          title="Requires Attention"
          subtitle="Highest-priority potential findings"
        >
          <RequiresAttention items={requiresAttention} />
        </SectionCard>
      </div>

      {/* Section 6 — navigation entry points */}
      <div className="rounded-card border border-border bg-surface p-6">
        <ExploreLinks links={EXPLORE_LINKS} />
      </div>

      <p className="text-caption text-text-muted">
        {usingRealData
          ? "Figures from your connected LeakLens backend."
          : "Illustrative demo data — not real company figures."}
      </p>
    </div>
  );
}
