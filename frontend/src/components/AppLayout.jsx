// AppLayout.jsx — refined enterprise application shell.
// Sidebar: quiet, 224px, collapsible to an icon rail (persisted).
// Header: 64px — universal centered search (⌘K), alerts + profile right.
// Active nav: soft blue tint + small indicator — never glowing.
// Content column is capped at 1440px with generous gutters.

import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertIcon,
  ChartIcon,
  CloseIcon,
  DocIcon,
  GridIcon,
  HomeIcon,
  LensLogo,
  ListIcon,
  MenuIcon,
  PanelIcon,
  SearchIcon,
  UploadIcon,
} from "./ui/Icons";
import SidePanel from "./SidePanel";
import { clearSession } from "../services/auth";

const NAV_MAIN = [
  { to: "/home", label: "Home", icon: HomeIcon },
  { to: "/dashboard", label: "Dashboard", icon: GridIcon },
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
      end={item.to === "/home"}
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

/** Avatar initials from the signed-in profile (falls back to the demo persona). */
function initialsOf() {
  try {
    const user = JSON.parse(localStorage.getItem("leaklens.user") || "null");
    const name = user?.fullName?.trim();
    if (name) {
      return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");
    }
    if (user?.email) return user.email.slice(0, 2).toUpperCase();
  } catch {
    /* ignore malformed profile */
  }
  return "M1";
}

/** Top-right avatar with the account dropdown (profile / email / logout). */
function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return undefined;
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const logout = () => {
    setOpen(false);
    clearSession();
    navigate("/login");
  };

  const itemClass =
    "flex w-full items-center px-4 py-2.5 text-left text-small text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-elevated text-caption font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
      >
        {initialsOf()}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-card border border-border bg-surface-elevated shadow-[var(--shadow-card)]"
        >
          <button role="menuitem" type="button" onClick={() => go("/profile")} className={itemClass}>
            Profile
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => go("/profile?action=change-email")}
            className={itemClass}
          >
            Change Email
          </button>
          <div className="my-1 border-t border-border" />
          <button
            role="menuitem"
            type="button"
            onClick={logout}
            className={`${itemClass} text-danger hover:text-danger`}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children, flaggedCount }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(
    () => localStorage.getItem("leaklens.rail") === "1",
  );
  const [sidePanel, setSidePanel] = useState(null); // "settings" | "help" | null
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close the side panel on navigation.
  useEffect(() => {
    setSidePanel(null);
  }, [location.pathname]);

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
      {/* Brand — with the sidebar toggle living here, beside the wordmark */}
      <div
        className={`flex items-center py-6 ${
          railCollapsed ? "justify-center px-3" : "justify-between px-5"
        }`}
      >
        {!railCollapsed && (
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="LeakLens home">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-border bg-surface-elevated text-accent">
              <LensLogo size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold leading-tight tracking-tight text-text-primary">
                LeakLens
              </span>
            </span>
          </Link>
        )}
        <button
          type="button"
          className="rounded-control p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
          onClick={toggleRail}
          aria-label={railCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelIcon size={15} />
        </button>
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
          {NAV_SECONDARY.map((item) => {
            const key = item.label.toLowerCase();
            const active = sidePanel === key;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setSidePanel(active ? null : key)}
                aria-expanded={active}
                title={railCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-control px-3 py-2.5 text-small font-medium transition-colors ${
                  railCollapsed ? "justify-center px-0" : ""
                } ${
                  active
                    ? "bg-accent-soft text-text-primary"
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                }`}
              >
                <item.icon size={16} />
                {!railCollapsed && <span className="flex-1 truncate text-left">{item.label}</span>}
              </button>
            );
          })}
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
          {/* Universal header: shell toggles left · search centered ·
              notifications + profile right. No breadcrumb text. */}
          <div className="content-shell grid h-16 grid-cols-[1fr_minmax(0,28rem)_1fr] items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-control p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <MenuIcon size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchRef.current?.value.trim();
                if (q) navigate(`/transactions?q=${encodeURIComponent(q)}`);
              }}
              className="flex min-w-0 items-center gap-2.5 rounded-control border border-border bg-surface px-3.5 py-2 text-small text-text-muted transition-colors focus-within:border-border-strong"
            >
              <SearchIcon size={14} className="shrink-0" />
              <input
                ref={searchRef}
                placeholder="Search transactions…"
                aria-label="Search transactions"
                className="w-full min-w-0 bg-transparent text-text-primary outline-none placeholder:text-text-muted"
              />
              <kbd className="tnum hidden rounded border border-border px-1 text-[10px] text-text-muted sm:block">
                ⌘K
              </kbd>
            </form>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate("/investigation")}
                className="relative rounded-control p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                aria-label={`Notifications — ${flaggedCount ?? 0} transactions require investigation`}
                title="Transactions requiring investigation"
              >
                <AlertIcon size={16} />
                {flaggedCount > 0 && (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-danger" />
                )}
              </button>
              <ProfileMenu />
            </div>
          </div>
        </header>

        <main
          className={`flex-1 pb-16 pt-8 transition-[margin] duration-200 ${
            sidePanel
              ? railCollapsed
                ? "lg:ml-[392px]"
                : "lg:ml-80"
              : ""
          }`}
        >
          <div className="content-shell">{children}</div>
        </main>
      </div>

      {/* Standing Settings / Help panel beside the sidebar */}
      <SidePanel
        panel={sidePanel}
        onClose={() => setSidePanel(null)}
        positionClass={railCollapsed ? "lg:left-[72px]" : "lg:left-56"}
      />
    </div>
  );
}
