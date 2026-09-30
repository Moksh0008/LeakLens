import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertIcon,
  ChartIcon,
  CloseIcon,
  GridIcon,
  LensLogo,
  ListIcon,
  MenuIcon,
  SearchIcon,
  UploadIcon,
} from "./ui/Icons";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: GridIcon, end: true },
  { to: "/transactions", label: "Transactions", icon: ListIcon },
  { to: "/upload", label: "Upload", icon: UploadIcon },
  { to: "/investigation", label: "Investigation", icon: SearchIcon },
  { to: "/analytics", label: "Analytics", icon: ChartIcon },
];

/**
 * AppLayout — sidebar + topbar + content area.
 * On mobile the sidebar becomes an overlay drawer.
 */
export default function AppLayout({ children, flaggedCount }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* ---------- Sidebar (desktop) ---------- */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-ink-200 bg-white lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-white">
            <LensLogo size={20} />
          </span>
          <div>
            <p className="text-[15px] font-semibold leading-tight text-ink-900">LeakLens</p>
            <p className="text-[11px] leading-tight text-ink-400">Procurement Intelligence</p>
          </div>
        </div>

        <nav className="mt-2 flex flex-1 flex-col gap-0.5 px-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-ink-500 hover:bg-ink-50 hover:text-ink-800"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-ink-100 p-4">
          <div className="rounded-lg bg-ink-900 p-3.5 text-white">
            <div className="flex items-center gap-2">
              <AlertIcon size={15} className="text-red-400" />
              <p className="text-xs font-medium text-ink-200">Leakage alerts</p>
            </div>
            <p className="tnum mt-1.5 text-2xl font-semibold">
              {flaggedCount ?? "—"}
            </p>
            <p className="text-[11px] text-ink-400">transactions flagged for review</p>
          </div>
        </div>
      </aside>

      {/* ---------- Mobile drawer ---------- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/40"
            onClick={() => setMobileOpen(false)}
          />
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-ink-200 bg-white"
          >
            <div className="flex items-center justify-between px-5 py-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-900 text-white">
                  <LensLogo size={20} />
                </span>
                <p className="text-[15px] font-semibold text-ink-900">LeakLens</p>
              </div>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <CloseIcon size={20} className="text-ink-400" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 px-3">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive ? "bg-brand-50 text-brand-700" : "text-ink-500 hover:bg-ink-50"
                    }`
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </motion.aside>
        </div>
      )}

      {/* ---------- Main column ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-ink-200 bg-white/90 px-4 backdrop-blur lg:px-8">
          <button
            type="button"
            className="text-ink-500 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <MenuIcon size={20} />
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-ink-200 bg-ink-50/60 px-3 py-1.5 text-sm text-ink-400 lg:max-w-sm">
            <SearchIcon size={15} />
            <span>Search transactions, suppliers…</span>
          </div>
          <span className="ml-auto hidden rounded-full bg-brand-50 px-3 py-1 text-[11px] font-medium text-brand-700 ring-1 ring-inset ring-brand-200 sm:inline">
            FINATHON 2026 · FIN-04
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white">
            M1
          </span>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
