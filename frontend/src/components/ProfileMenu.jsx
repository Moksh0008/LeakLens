// ProfileMenu.jsx — shared avatar + account dropdown.
// Used in the app-shell header AND on the landing navbar, so a signed-in
// visitor sees the same account controls everywhere (Profile / Change
// Email / Log out) instead of being treated as signed out.

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession } from "../services/auth";

/** Avatar initials from the signed-in profile (falls back to the demo persona). */
export function initialsOf() {
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

export default function ProfileMenu() {
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
        title="Account"
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
