// Footer.jsx — minimal, professional.

import { Link } from "react-router-dom";
import { LensLogo } from "../ui/Icons";
import { isSignedIn } from "../../services/auth";

const SECTIONS = [
  { label: "Product", href: "#product" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Insights", href: "#insights" },
];

const ROUTES_SIGNED_OUT = [
  { label: "Login", to: "/login" },
  { label: "Get Started", to: "/signup" },
];

const ROUTES_SIGNED_IN = [
  { label: "Workspace", to: "/home" },
  { label: "Profile", to: "/profile" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-elevated text-accent">
              <LensLogo size={16} />
            </span>
            <span className="font-semibold text-text-primary">LeakLens</span>
          </div>
          <p className="mt-2 text-small text-text-muted">Procurement Spend Intelligence</p>
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-4">
          <nav aria-label="Product sections" className="flex flex-col gap-2">
            {SECTIONS.map((s) => (
              <a key={s.href} href={s.href} className="text-small text-text-secondary transition-colors hover:text-text-primary">
                {s.label}
              </a>
            ))}
          </nav>
          <nav aria-label="Account" className="flex flex-col gap-2">
            {(isSignedIn() ? ROUTES_SIGNED_IN : ROUTES_SIGNED_OUT).map((r) => (
              <Link key={r.to} to={r.to} className="text-small text-text-secondary transition-colors hover:text-text-primary">
                {r.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto max-w-7xl px-4 py-4 text-caption text-text-muted sm:px-6 lg:px-8">
          FINATHON 2026 · FIN-04 — Procurement Spend Leakage · Illustrative demo data only
        </p>
      </div>
    </footer>
  );
}
