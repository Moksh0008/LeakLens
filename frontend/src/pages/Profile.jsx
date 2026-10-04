// Profile.jsx — /profile. Account overview: identity card, live workspace
// stats, account details, and security forms (change password / email).
// Real mode talks to /api/auth/* (token + current password); mock mode
// updates the local demo profile so every flow still works.

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Button from "../components/ui/Button";
import { TextField, PasswordField } from "../components/auth/fields";
import {
  ActivityIcon,
  BadgeCheckIcon,
  BuildingIcon,
  CalendarIcon,
  CheckIcon,
  CopyIcon,
  KeyIcon,
  MailIcon,
  ShieldIcon,
  UserIcon,
} from "../components/ui/Icons";
import { changeEmail, changePassword, clearSession } from "../services/auth";
import { getDashboard } from "../services/api";
import { formatCompactINR, formatDate, formatNumber, formatPercent } from "../utils/format";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("leaklens.user") || "null");
  } catch {
    return null;
  }
}

function initialsOf(user) {
  const name = user?.fullName?.trim();
  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }
  if (user?.email) return user.email.slice(0, 2).toUpperCase();
  return "M1";
}

/** 0–4 password score: length, case mix, digits, symbols. */
function passwordScore(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 0.5;
  if (/[^A-Za-z0-9]/.test(pw)) score += 0.5;
  return Math.min(4, Math.round(score));
}

const STRENGTH = [
  { label: "Too short", class: "bg-danger" },
  { label: "Weak", class: "bg-danger" },
  { label: "Fair", class: "bg-warning" },
  { label: "Good", class: "bg-success" },
  { label: "Strong", class: "bg-success" },
];

function StrengthMeter({ password }) {
  const score = passwordScore(password);
  const meta = STRENGTH[score];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={`h-1 flex-1 rounded-full transition-colors ${
              step <= score ? meta.class : "bg-border"
            }`}
          />
        ))}
      </div>
      {password && (
        <p className="text-caption text-text-muted">
          Strength: <span className="text-text-secondary">{meta.label}</span>
        </p>
      )}
    </div>
  );
}

/** Row in the account-details card, with optional copy button. */
function DetailRow({ icon: Icon, label, value, mono, copyable }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    try {
      navigator.clipboard?.writeText(String(value));
    } catch {
      /* clipboard unavailable — the visual ack is enough */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-3 py-3.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control border border-border bg-surface-elevated text-text-muted">
        <Icon size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-caption text-text-muted">{label}</p>
        <p
          className={`truncate text-small text-text-primary ${mono ? "font-mono" : ""}`}
          title={typeof value === "string" ? value : undefined}
        >
          {value}
        </p>
      </div>
      {copyable && (
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${label}`}
          className="rounded-control p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
        </button>
      )}
    </div>
  );
}

/** Loading placeholder tile. */
function StatSkeleton() {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="h-3 w-20 animate-pulse rounded-full bg-surface-elevated" />
      <div className="mt-3 h-6 w-16 animate-pulse rounded-full bg-surface-elevated" />
    </div>
  );
}

export default function Profile() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusEmail = searchParams.get("action") === "change-email";
  const emailRef = useRef(null);

  const [user, setUser] = useState(readStoredUser);
  const [dash, setDash] = useState(null);
  const [dashFailed, setDashFailed] = useState(false);

  // Change-email form state
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);

  // Change-password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // Live workspace stats (same rollup the dashboard uses).
  useEffect(() => {
    let active = true;
    getDashboard()
      .then((data) => {
        if (active) {
          setDash(data);
          setDashFailed(false);
        }
      })
      .catch(() => {
        if (active) setDashFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // "Change Email" from the avatar menu lands here ready to type.
  useEffect(() => {
    if (focusEmail) {
      emailRef.current?.querySelector("input")?.focus();
      emailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusEmail]);

  function clearMessages() {
    setNotice("");
    setError("");
  }

  function onEmailSubmit(e) {
    e.preventDefault();
    clearMessages();

    if (!EMAIL_RE.test(newEmail.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!emailPassword) {
      setError("Enter your current password to confirm the change.");
      return;
    }

    setEmailBusy(true);
    changeEmail(newEmail.trim(), emailPassword)
      .then((body) => {
        setUser(readStoredUser() || user);
        setNewEmail("");
        setEmailPassword("");
        setNotice(body.message || "Email updated.");
      })
      .catch((err) => setError(err.message || "Could not change the email."))
      .finally(() => setEmailBusy(false));
  }

  function onPasswordSubmit(e) {
    e.preventDefault();
    clearMessages();

    if (!currentPassword) {
      setError("Enter your current password first.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setPasswordBusy(true);
    changePassword(currentPassword, newPassword)
      .then((body) => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setNotice(body.message || "Password updated.");
      })
      .catch((err) => setError(err.message || "Could not change the password."))
      .finally(() => setPasswordBusy(false));
  }

  function logout() {
    clearSession();
    navigate("/login");
  }

  // Real mode with no session: nothing to show here.
  if (!USE_MOCK && !user) {
    return (
      <div className="flex flex-col gap-8">
        <h2 className="text-heading font-semibold text-text-primary">Profile</h2>
        <div className="rounded-card border border-border bg-surface p-6">
          <p className="text-small text-text-secondary">
            You are not signed in.
          </p>
          <div className="mt-5">
            <Link to="/login">
              <Button variant="primary">Go to sign in</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const hasData = dash ? Number(dash.transactionsAnalyzed || 0) > 0 : false;
  const leakageRate =
    dash && dash.totalProcurement
      ? (dash.potentialLeakage / dash.totalProcurement) * 100
      : null;

  const stats = dash
    ? [
        {
          label: "Transactions analyzed",
          value: formatNumber(dash.transactionsAnalyzed),
        },
        {
          label: "Leakage findings",
          value: formatNumber(dash.flaggedTransactions),
        },
        {
          label: "Potential leakage",
          value: formatCompactINR(dash.potentialLeakage),
        },
        {
          label: "Leakage rate",
          value: formatPercent(leakageRate ?? 0),
        },
      ]
    : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-heading font-semibold text-text-primary">Profile</h2>
        <p className="mt-1.5 text-body text-text-secondary">
          Your account, workspace activity and security settings.
        </p>
      </div>

      {/* Identity card */}
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-card border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8"
      >
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-section font-semibold text-accent">
            {initialsOf(user)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-section font-semibold text-text-primary">
                {user?.fullName || "LeakLens user"}
              </p>
              <span className="inline-flex items-center gap-1 rounded-control border border-success/25 bg-success/10 px-2 py-0.5 text-caption text-success">
                <BadgeCheckIcon size={12} />
                Verified
              </span>
            </div>
            <p className="mt-0.5 truncate text-small text-text-secondary">
              {user?.email || "—"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-caption text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <BuildingIcon size={12} />
                {user?.organization || "No organization set"}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <UserIcon size={12} />
                {user?.role || "Member"}
              </span>
              {user?.createdAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarIcon size={12} />
                    Since {formatDate(user.createdAt)}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="ml-auto">
            <Button variant="danger" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Workspace activity */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-section font-semibold text-text-primary">
            Workspace activity
          </h3>
          <span
            className={`inline-flex items-center gap-1.5 rounded-control border px-2.5 py-1 text-caption ${
              dashFailed
                ? "border-warning/25 bg-warning/10 text-warning"
                : hasData
                  ? "border-success/25 bg-success/10 text-success"
                  : "border-border bg-surface-elevated text-text-muted"
            }`}
          >
            <ActivityIcon size={12} />
            {dashFailed
              ? "Stats unavailable"
              : hasData
                ? "Live · synced"
                : dash
                  ? "No data yet"
                  : "Loading…"}
          </span>
        </div>

        {!stats && !dashFailed && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </div>
        )}

        {stats && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-card border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
              >
                <p className="text-caption text-text-muted">{stat.label}</p>
                <p className="mt-1.5 text-section font-semibold text-text-primary">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {dashFailed && (
          <div className="rounded-card border border-border bg-surface p-6">
            <p className="text-small text-text-secondary">
              Workspace stats could not be loaded right now. Your account
              settings below are unaffected.
            </p>
          </div>
        )}

        {dash && !hasData && !dashFailed && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-amber-500/25 bg-amber-500/[0.06] px-5 py-4">
            <p className="text-small text-amber-200">
              Your workspace is empty — upload a procurement CSV to see live
              stats here.
            </p>
            <Link to="/upload">
              <Button variant="secondary" size="sm">
                Go to upload
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Account details + security */}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* Account details */}
        <section className="rounded-card border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h3 className="text-section font-semibold text-text-primary">
            Account details
          </h3>
          <p className="mt-2 text-small text-text-secondary">
            Read-only information linked to your sign-in.
          </p>
          <div className="mt-4 divide-y divide-border">
            <DetailRow
              icon={MailIcon}
              label="Email"
              value={user?.email || "—"}
              copyable={!!user?.email}
            />
            <DetailRow
              icon={BuildingIcon}
              label="Organization"
              value={user?.organization || "—"}
            />
            <DetailRow
              icon={ShieldIcon}
              label="Role"
              value={user?.role || "Member"}
            />
            <DetailRow
              icon={CalendarIcon}
              label="Member since"
              value={user?.createdAt ? formatDate(user.createdAt) : "—"}
            />
            <DetailRow
              icon={KeyIcon}
              label="User ID"
              value={user?.id || "—"}
              mono
              copyable={!!user?.id}
            />
          </div>
        </section>

        {/* Security forms */}
        <div className="flex flex-col gap-6">
          {error && (
            <p
              role="alert"
              className="rounded-control border border-danger/25 bg-danger/[0.06] px-4 py-3 text-small text-danger"
            >
              {error}
            </p>
          )}
          {notice && (
            <p
              role="status"
              className="rounded-control border border-success/25 bg-success/[0.06] px-4 py-3 text-small text-success"
            >
              {notice}
            </p>
          )}

          <section className="rounded-card border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
            <h3 className="text-section font-semibold text-text-primary">
              Change Password
            </h3>
            <p className="mt-2 text-small text-text-secondary">
              Pick a strong password you don't use anywhere else.
            </p>
            <form
              onSubmit={onPasswordSubmit}
              noValidate
              className="mt-6 flex flex-col gap-5"
            >
              <PasswordField
                label="Current Password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <div className="flex flex-col gap-2">
                <PasswordField
                  label="New Password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <StrengthMeter password={newPassword} />
              </div>
              <PasswordField
                label="Confirm New Password"
                autoComplete="new-password"
                placeholder="Repeat the new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div>
                <Button type="submit" variant="primary" disabled={passwordBusy}>
                  {passwordBusy ? "Updating…" : "Update Password"}
                </Button>
              </div>
            </form>
          </section>

          <section
            ref={emailRef}
            className="rounded-card border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8"
          >
            <h3 className="text-section font-semibold text-text-primary">
              Change Email
            </h3>
            <p className="mt-2 text-small text-text-secondary">
              Update the email you use to sign in. Confirm with your current
              password.
            </p>
            <form
              onSubmit={onEmailSubmit}
              noValidate
              className="mt-6 flex flex-col gap-5"
            >
              <TextField
                label="New Email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <PasswordField
                label="Current Password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
              />
              <div>
                <Button type="submit" variant="primary" disabled={emailBusy}>
                  {emailBusy ? "Updating…" : "Update Email"}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
