// AppLayout.jsx — enterprise application shell.
// Sidebar: brand, grouped procurement navigation, Settings/Help, alerts panel.
// Header: compact — breadcrumb, page title, global search, notification, profile.
// Active nav: brighter surface + blue left indicator + subtle glow.
// On mobile the sidebar becomes an overlay drawer.

import { useEffect, useState } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertIcon,
  ChartIcon,
  CloseIcon,
  DocIcon,
  GridIcon,
  LensLogo,
  ListIcon,
  MenuIcon,
  SearchIcon,
  UploadIcon,
} from "./ui/Icons";

const NAV_MAIN = [
  { to: "/dashboard", label: "Overview", icon: GridIcon },
  { to: "/transactions", label: "Transactions", icon: ListIcon },
  { to: "/price-benchmarking", label: "Price Benchmarking", icon: ChartIcon, soon: true },
  { to: "/supplier-analysis", label: "Supplier Analysis", icon: DocIcon, soon: true },
  { to: "/contracts", label: "Contracts & Discounts", icon: DocIcon, soon: true },
  { to: "/leakage", label: "Leakage Analysis", icon: AlertIcon, soon: true },
  { to: "/upload", label: "Data Import", icon: UploadIcon },
];

const NAV_SECONDARY = [
  { to: "#", label: "Settings", icon: DocIcon, soon: true },
  { to: "#", label: "Help", icon: DocIcon, soon: true },
];

const TITLES = {
  "/dashboard": ["Overview", "Procurement leakage overview"],
  "/transactions": ["Transactions", "All analyzed procurement records"],
  "/upload": ["Data Import", "Upload procurement CSV for analysis"],
  "/investigation": ["Investigation", "Flagged transaction evidence"],
  "/analytics": ["Analytics", "Supplier and detection analysis"],
};

function NavItem({ item, onNavigate }) {
  const Icon = item.icon;
  const className = ({ isActive }) =>
    `group relative flex items-center gap-2.5 rounded-control px-3 py-2 text-small font-medium transition-colors ${
      isActive
        ? "active bg-surface-hover text-text-primary glow-accent"
        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
    }`;

  const inner = (
    <>
      {/* Blue left indicator for the active item */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent transition-opacity duration-150 opacity-0 group-[.active]:opacity-100"
      />
      <Icon size={16} className={item.soon ? "opacity-60" : ""} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.soon && (
        <span className="rounded-full border border-border px-1.5 py-px text-[10px] text-text-muted">
          soon
        </span>
      )}
    </>
  );

  if (item.to.startsWith("#")) {
    return (
      <span className={`${className({ isActive: false })} cursor-not-allowed opacity-60`}>
        {inner}
      </span>
    );
  }
  return (
    <NavLink to={item.to} end={item.to === "/dashboard"} className={className}>
      {inner}
    </NavLink>
  );
}

export default function AppLayout({ children, flaggedCount }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [crumb, title] = TITLES[location.pathname] || ["LeakLens", "Procurement intelligence"];

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const sidebarBody = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-elevated text-accent">
          <LensLogo size={19} />
        </span>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-tight tracking-tight text-text-primary">
            LeakLens
          </p>
          <p className="overline mt-0.5">Procurement Intelligence</p>
        </div>
      </div>

      {/* Primary navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3" aria-label="Primary">
        <p className="overline px-3 pb-2 pt-1">Analysis</p>
        {NAV_MAIN.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}

        <p className="overline mt-5 px-3 pb-2">System</p>
        {NAV_SECONDARY.map((item) => (
          <NavItem key={item.label} item={item} />
        ))}
      </nav>

      {/* Leakage alerts panel */}
      <div className="p-4">
        <Link
          to="/investigation"
          className="block rounded-card border border-border bg-surface-elevated p-3.5 transition-colors hover:border-border-strong"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertIcon size={15} className="text-danger" />
              <p className="text-small font-medium text-text-primary">Leakage alerts</p>
            </div>
            <span className="tnum rounded-full bg-danger/15 px-2 py-0.5 text-[11px] font-semibold text-danger">
              {flaggedCount ?? "—"}
            </span>
          </div>
          <p className="mt-1.5 text-caption text-text-muted">
            transactions require investigation
          </p>
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* ---------- Sidebar (desktop) ---------- */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-background-2 lg:flex">
        {sidebarBody}
      </aside>

      {/* ---------- Mobile drawer ---------- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border bg-background-2"
          >
            <button
              type="button"
              className="absolute right-3 top-5 text-text-muted hover:text-text-primary"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <CloseIcon size={18} />
            </button>
            {sidebarBody}
          </motion.aside>
        </div>
      )}

      {/* ---------- Main column ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Compact header */}
        <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-border bg-background-2/90 px-4 backdrop-blur lg:px-6">
          <button
            type="button"
            className="rounded-control p-1.5 text-text-secondary hover:bg-surface-hover hover:text-text-primary lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon size={18} />
          </button>

          {/* Breadcrumb + page title */}
          <div className="flex min-w-0 items-center gap-2 text-caption">
            <span className="text-text-muted">LeakLens</span>
            <span className="text-border-strong">/</span>
            <span className="truncate font-medium text-text-secondary">{crumb}</span>
          </div>
          <h1 className="hidden text-small font-semibold text-text-primary md:block">
            {title}
          </h1>

          {/* Global search */}
          <div className="ml-auto flex items-center gap-2">
            <label className="hidden items-center gap-2 rounded-control border border-border bg-surface px-3 py-1.5 text-small text-text-muted focus-within:border-border-strong md:flex lg:w-64">
              <SearchIcon size={14} />
              <input
                placeholder="Search transactions…"
                className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted"
              />
            </label>
            <button
              type="button"
              className="relative rounded-control border border-border bg-surface p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              aria-label="Notifications"
            >
              <AlertIcon size={15} />
              {flaggedCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-semibold text-white">
                  {flaggedCount > 99 ? "99+" : flaggedCount}
                </span>
              )}
            </button>
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-elevated text-caption font-semibold text-text-secondary"
              title="Member 1 — Frontend"
            >
              M1
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
