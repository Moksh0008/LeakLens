// SidePanel.jsx — standing panel that opens beside the sidebar for
// Settings and Help. Every control is functional and persists via
// localStorage. Esc / backdrop click closes it. On mobile it overlays.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { CloseIcon } from "./ui/Icons";

const PREFS = {
  defaultLanding: "leaklens.defaultLanding", // "home" | "dashboard"
  pageSize: "leaklens.pageSize",             // "25" | "50" | "100"
  alertFloor: "leaklens.alertsSeverity",     // "ALL" | "MEDIUM_PLUS" | "HIGH"
  currency: "leaklens.currency",             // "INR" | "USD"
  density: "leaklens.density",               // "comfortable" | "compact"
  motion: "leaklens.motion",                 // "full" | "reduced"
};

export function getPref(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function setPref(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — control still reflects the session choice */
  }
}

/** localStorage-backed preference state — re-renders the panel on change. */
function usePref(key, fallback) {
  const [value, setValue] = useState(() => getPref(key, fallback));
  const update = (v) => {
    setPref(key, v);
    setValue(v);
    // Pages listen for this so open views apply the pref immediately.
    window.dispatchEvent(new Event("leaklens.prefs-changed"));
  };
  return [value, update];
}

/** One row: label + description + a working segmented control. */
function PrefRow({ label, description, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-2.5 py-4">
      <div>
        <p className="text-small font-medium text-text-primary">{label}</p>
        <p className="mt-0.5 text-caption text-text-muted">{description}</p>
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex gap-1 rounded-control border border-border bg-background-2 p-1"
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 rounded-[6px] px-2 py-1.5 text-caption font-medium transition-colors ${
              value === opt.value
                ? "bg-accent-soft text-text-primary"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SettingsContent() {
  const [landing, setLanding] = usePref(PREFS.defaultLanding, "home");
  const [pageSize, setPageSize] = usePref(PREFS.pageSize, "50");
  const [alertFloor, setAlertFloor] = usePref(PREFS.alertFloor, "ALL");
  const [currency, setCurrency] = usePref(PREFS.currency, "INR");
  const [density, setDensity] = usePref(PREFS.density, "comfortable");
  const [motion, setMotionPref] = usePref(PREFS.motion, "full");

  return (
    <div className="flex flex-col">
      <p className="overline pb-1 pt-1 text-[10px]">Workspace</p>
      <div className="divide-y divide-border">
        <PrefRow
          label="Default landing page"
          description="Where to go after signing in."
          options={[
            { value: "home", label: "Home" },
            { value: "dashboard", label: "Dashboard" },
          ]}
          value={landing}
          onChange={setLanding}
        />
        <PrefRow
          label="Table rows per page"
          description="How many transactions the ledger loads at once."
          options={[
            { value: "25", label: "25" },
            { value: "50", label: "50" },
            { value: "100", label: "100" },
          ]}
          value={pageSize}
          onChange={setPageSize}
        />
        <PrefRow
          label="Alert severity floor"
          description="Lowest severity shown in the leakage alert feed."
          options={[
            { value: "ALL", label: "All" },
            { value: "MEDIUM_PLUS", label: "Medium+" },
            { value: "HIGH", label: "High only" },
          ]}
          value={alertFloor}
          onChange={setAlertFloor}
        />
        <PrefRow
          label="Currency display"
          description="Symbol shown on amounts — values are not converted."
          options={[
            { value: "INR", label: "INR ₹" },
            { value: "USD", label: "USD $" },
          ]}
          value={currency}
          onChange={setCurrency}
        />
      </div>

      <p className="overline pb-1 pt-5 text-[10px]">Appearance</p>
      <div className="divide-y divide-border">
        <PrefRow
          label="Interface density"
          description="Spacing used across tables and lists."
          options={[
            { value: "comfortable", label: "Comfortable" },
            { value: "compact", label: "Compact" },
          ]}
          value={density}
          onChange={setDensity}
        />
        <PrefRow
          label="Interface motion"
          description="Reduce animation for a calmer, faster feel."
          options={[
            { value: "full", label: "Full" },
            { value: "reduced", label: "Reduced" },
          ]}
          value={motion}
          onChange={setMotionPref}
        />
      </div>

      <p className="pt-5 text-caption text-text-muted">
        Preferences are stored on this device and apply instantly.
      </p>
    </div>
  );
}

function HelpContent() {
  const rows = [
    {
      title: "How does LeakLens find leakage?",
      body: "Transactions are compared against historical benchmarks, supplier medians and contract terms. Statistically unusual prices, quantities and patterns are flagged with an estimated impact.",
    },
    {
      title: "What do severities mean?",
      body: "LOW — worth monitoring. MEDIUM — should be reviewed this cycle. HIGH — potential impact is significant; investigate first.",
    },
    {
      title: "Are findings proof of wrongdoing?",
      body: "No. Findings are potential anomalies for review — e.g. Potential Excess Cost or Missed Discount. Nothing is ever labelled as fraud without verified evidence.",
    },
    {
      title: "How is financial impact calculated?",
      body: "For price findings: (actual unit price − benchmark) × quantity. Consolidation savings are estimated from spend concentration; missed discounts from the negotiated tier gap.",
    },
  ];
  const links = [
    { label: "Explore the Dashboard", to: "/dashboard", hint: "Spend, leakage trends, severity and high-impact records" },
    { label: "Review recent Transactions", to: "/transactions", hint: "Search and filter every analyzed record" },
    { label: "Import procurement data", to: "/import", hint: "Run analysis on a new CSV" },
    { label: "Investigate flagged items", to: "/investigation", hint: "Reason, evidence and impact math" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        {rows.map((f) => (
          <details key={f.title} className="group rounded-control border border-border bg-background-2 px-4 py-3">
            <summary className="cursor-pointer list-none text-small font-medium text-text-primary marker:hidden">
              {f.title}
            </summary>
            <p className="mt-2 text-small text-text-secondary">{f.body}</p>
          </details>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <p className="overline text-[10px]">Quick links</p>
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="rounded-control border border-border bg-background-2 px-4 py-3 transition-colors hover:border-border-strong"
          >
            <p className="text-small font-medium text-text-primary">{l.label}</p>
            <p className="mt-0.5 text-caption text-text-muted">{l.hint}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

/**
 * SidePanel — standing rectangle beside the sidebar.
 * `panel` is "settings" | "help" | null; `positionClass` aligns its left
 * edge with the sidebar's current width (full or collapsed rail).
 */
export default function SidePanel({ panel, onClose, positionClass = "lg:left-56" }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (panel) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, onClose]);

  const isSettings = panel === "settings";

  return (
    <AnimatePresence>
      {panel && (
        <>
          {/* Click-away layer (transparent on desktop so the layout stands still) */}
          <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden="true" />

          <motion.aside
            initial={reduce ? { opacity: 0 } : { x: -24, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { x: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { x: -24, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            role="complementary"
            aria-label={isSettings ? "Settings" : "Help"}
            className={`fixed top-16 bottom-0 z-40 flex w-[320px] flex-col overflow-y-auto border-r border-border bg-background-2 px-5 py-6 max-lg:left-0 max-lg:w-full ${positionClass}`}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-section font-semibold text-text-primary">
                {isSettings ? "Settings" : "Help"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="rounded-control p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            {isSettings ? <SettingsContent /> : <HelpContent />}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
