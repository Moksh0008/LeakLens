// AuthLayout.jsx — shared shell for Login and Signup.
// Desktop: brand + value proposition left (with a restrained analytics
// visual), form right. Mobile: compact brand header, full-width form.
// Illustrative figures only — clearly labelled demo values.

import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { LensLogo } from "../ui/Icons";

const EASE = [0.22, 1, 0.36, 1];

const METRICS = [
  { label: "Potential Leakage", value: "₹1.84M", accent: "text-danger" },
  { label: "Potential Missed Savings", value: "₹620K", accent: "text-warning" },
  { label: "Transactions Requiring Investigation", value: "147", accent: "text-text-primary" },
];

export default function AuthLayout({ children }) {
  const reduce = useReducedMotion();
  const rise = (delay) => ({
    initial: { opacity: 0, y: reduce ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduce ? 0.2 : 0.5, ease: EASE, delay },
  });

  return (
    <div className="grid min-h-screen bg-background text-text-primary lg:grid-cols-[1.05fr_1fr]">
      {/* ---------- Left: brand + value proposition ---------- */}
      <div className="relative hidden flex-col justify-between px-10 py-12 lg:flex xl:px-16">
        <Link to="/" className="flex items-center gap-3" aria-label="LeakLens home">
          <span className="flex h-9 w-9 items-center justify-center rounded-control border border-border bg-surface-elevated text-accent">
            <LensLogo size={18} />
          </span>
          <span className="flex flex-col">
            <span className="text-[15px] font-semibold leading-tight tracking-tight">
              LeakLens
            </span>
          </span>
        </Link>

        <div className="max-w-md">
          <motion.h1 {...rise(0.05)} className="text-display font-semibold leading-[1.15]">
            Find where procurement spend leaks.
          </motion.h1>
          <motion.p {...rise(0.12)} className="mt-5 text-body text-text-secondary">
            Analyze procurement transactions, benchmark prices, identify
            exceptions and uncover potential savings opportunities.
          </motion.p>

          {/* Restrained analytics visual — three quiet metric rows */}
          <motion.div
            {...rise(0.2)}
            className="mt-10 max-w-sm rounded-card border border-border bg-surface p-5"
            aria-label="Illustrative product metrics"
          >
            <p className="overline mb-4 text-[10px]">Illustrative · demo values</p>
            <ul className="flex flex-col gap-4">
              {METRICS.map((m) => (
                <li key={m.label} className="flex items-center justify-between gap-4">
                  <span className="text-small text-text-secondary">{m.label}</span>
                  <span className={`tnum text-small font-semibold ${m.accent}`}>{m.value}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <p className="text-caption text-text-muted">
          FINATHON 2026 · FIN-04 — Procurement Spend Leakage
        </p>
      </div>

      {/* ---------- Right: form panel ---------- */}
      <div className="flex flex-col">
        {/* Mobile brand header */}
        <div className="border-b border-border px-6 py-5 lg:hidden">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-control border border-border bg-surface-elevated text-accent">
              <LensLogo size={15} />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">LeakLens</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0.2 : 0.5, ease: EASE, delay: 0.1 }}
            className="w-full max-w-[420px]"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
