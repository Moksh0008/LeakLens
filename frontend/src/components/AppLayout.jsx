// AppLayout.jsx — refined enterprise application shell.
// Sidebar: quiet, 224px, collapsible to an icon rail (persisted).
// Header: 64px, breadcrumb + title + search (⌘K) + alerts + profile.
// Active nav: soft blue tint + small indicator — never glowing.
// Content column is capped at 1440px with generous gutters.

import { useEffect, useRef, useState } from "react";
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
  PanelIcon,
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
  "/price-benchmarking": ["Price Benchmarking", "Benchmark prices across suppliers"],
  "/supplier-analysis": ["Supplier Analysis", "Spend concentration and overlap"],
  "/contracts": ["Contracts & Discounts", "Contract terms and exceptions"],
  "/leakage": ["Leakage Analysis", "Leakage patterns in depth"],
};

function NavItem({ item, collapsed = false }) {
  const Icon = item.icon;
  const className = ({ isActive }) =>
    `relative flex items-center gap-3 rounded-control text-small font-medium transition-colors duration-150 ${
      collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"
    } ${
      isActive
        ? "bg-accent-soft text-text-primary"
        : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
    }`;

  const inner = (
    <>
      {/* Small accent indicator for the active item — a whisper, not a glow */}
      {isActiveBar(item)}
      <Icon size={16} className={item.soon ? "opacity-50" : ""} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.soon && (
            <span className="text-[10px] text-text-muted">soon</span>
          )}
        </>
      )}
    </>
  );

  if (item.to.startsWith("#")) {
    return (
      <span
        title={collapsed ? item.label : undefined}
        className={`${className({ isActive: false })} cursor-not-allowed opacity-50`}
      >
        {inner}
      </span>
    );
  }
  return (
    <NavLink
      to={item.to}
      end={item.to === "/dashboard"}
      title={collapsed ? item.label : undefined}
      className={className}
    >
      {inner}
    </NavLink>
  );
}

// Renders the 2px left indicator only when the NavLink is active.
function isActiveBar(item) {
  if (item.to.startsWith("#")) return null;
  return (
    <span
      aria-hidden="true"
      className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent opacity-0 [.active_&]:opacity-100"
    />
  );
}

export default function AppLayout({ children, flaggedCount }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(
    () => localStorage.getItem("leaklens.rail") === "1",
  );
  const searchRef = useRef(null);
  const location = useLocation();
  const [crumb, title] = TITLES[location.pathname] || ["LeakLens", "Procurement intelligence"];

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleRail = () => {
    setRailCollapsed((v) => {
      localStorage.setItem("leaklens.rail", v ? "0" : "1");
      return !v;
    });
  };

  const sidebarBody = (
    <>
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-6">
        <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="LeakLens home">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-border bg-surface-elevated text-accent">
            <LensLogo size={18} />
          </span>
          {!railCollapsed && (
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold leading-tight tracking-tight text-text-primary">
                LeakLens
              </span>
              <span className="overline mt-0.5 block text-[10px]">Procurement Intelligence</span>
            </span>
          )}
        </Link>
        {!railCollapsed && (
          <button
            type="button"
            onClick={toggleRail}
            aria-label="Collapse sidebar"
            className="hidden rounded-control p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary lg:block"
          >
            <PanelIcon size={15} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3" aria-label="Primary">
        {!railCollapsed && <p className="overline px-3 pb-2 pt-2 text-[10px]">Analysis</p>}
        <div className="flex flex-col gap-1">
          {NAV_MAIN.map((item) => (
            <NavItem key={item.label} item={item} collapsed={railCollapsed} />
          ))}
        </div>

        {!railCollapsed && (
          <p className="overline mt-8 px-3 pb-2 text-[10px]">System</p>
        )}
        {railCollapsed && <div className="mx-1 mt-8 border-t border-border" />}
        <div className="flex flex-col gap-1">
          {NAV_SECONDARY.map((item) => (
            <NavItem key={item.label} item={item} collapsed={railCollapsed} />
          ))}
        </div>
      </nav>

      {/* Alerts — quiet card, only red is the small count */}
      <div className="px-4 pb-5 pt-2">
        <Link
          to="/investigation"
          className="block rounded-card border border-border bg-surface p-4 transition-colors hover:border-border-strong"
        >
          <div className="flex items-center justify-between">
            <p className="text-small font-medium text-text-primary">Leakage alerts</p>
            <span className="tnum text-small font-semibold text-danger">
              {flaggedCount ?? "—"}
            </span>
          </div>
          <p className="mt-1 text-caption text-text-muted">
            transactions require investigation
          </p>
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* ---------- Sidebar (desktop) ---------- */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-background-2 transition-[width] duration-200 lg:flex ${
          railCollapsed ? "w-[72px]" : "w-56"
        }`}
      >
        {sidebarBody}
      </aside>

      {/* ---------- Mobile drawer ---------- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <motion.aside
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute left-0 top-0 flex h-full w-60 flex-col border-r border-border bg-background-2"
          >
            <button
              type="button"
              className="absolute right-3 top-6 text-text-muted hover:text-text-primary"
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
        {/* Header — 64px, quiet */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="content-shell flex h-16 items-center gap-4">
            <button
              type="button"
              className="rounded-control p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon size={18} />
            </button>
            <button
              type="button"
              className="hidden rounded-control p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary lg:block"
              onClick={toggleRail}
              aria-label={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelIcon size={15} />
            </button>

            <div className="flex min-w-0 items-baseline gap-2.5">
              <span className="text-caption text-text-muted">LeakLens</span>
              <span className="text-border-strong">/</span>
              <span className="truncate text-caption text-text-secondary">{crumb}</span>
              <h1 className="hidden text-small font-medium text-text-primary md:block">
                {title}
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <label className="hidden items-center gap-2.5 rounded-control border border-border bg-surface px-3.5 py-2 text-small text-text-muted transition-colors focus-within:border-border-strong md:flex lg:w-60">
                <SearchIcon size={14} />
                <input
                  ref={searchRef}
                  placeholder="Search transactions…"
                  className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted"
                />
                <kbd className="tnum rounded border border-border px-1 text-[10px] text-text-muted">
                  ⌘K
                </kbd>
              </label>
              <button
                type="button"
                className="relative rounded-control p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                aria-label="Notifications"
              >
                <AlertIcon size={16} />
                {flaggedCount > 0 && (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-danger" />
                )}
              </button>
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-elevated text-caption font-medium text-text-secondary"
                title="Member 1 — Frontend"
              >
                M1
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-16 pt-8">
          <div className="content-shell">{children}</div>
        </main>
      </div>
    </div>
  );
}
