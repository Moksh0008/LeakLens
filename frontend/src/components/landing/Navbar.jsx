// Navbar.jsx — public landing navigation.
// Left: wordmark. Center: section anchors. Right: Login / Get Started.
// Anchors scroll to landing sections; links use React Router where they
// point at routes (/login, /signup).

import { useState } from "react";
import { Link } from "react-router-dom";
import { LensLogo } from "../ui/Icons";
import Button from "../ui/Button";

const SECTIONS = [
  { label: "Product", href: "#product" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Insights", href: "#insights" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Wordmark */}
        <Link to="/" className="flex items-center gap-2.5" aria-label="LeakLens home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-elevated text-accent">
            <LensLogo size={19} />
          </span>
          <span className="text-[17px] font-semibold tracking-tight text-text-primary">
            LeakLens
          </span>
        </Link>

        {/* Section anchors (desktop) */}
        <div className="hidden items-center gap-1 md:flex">
          {SECTIONS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="rounded-control px-3 py-2 text-small font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              {s.label}
            </a>
          ))}
        </div>

        {/* Auth actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Link to="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="rounded-control p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-surface px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {SECTIONS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                onClick={() => setOpen(false)}
                className="rounded-control px-3 py-2.5 text-body font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              >
                {s.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2 border-t border-border pt-3">
              <Link to="/login" className="flex-1">
                <Button variant="secondary" className="w-full">Log in</Button>
              </Link>
              <Link to="/signup" className="flex-1">
                <Button variant="primary" className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
