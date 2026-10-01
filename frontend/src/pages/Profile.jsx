// Profile.jsx — /profile. Account details, change-email form, logout.
// Real mode talks to /api/auth/change-email (token + current password);
// mock mode updates the local demo profile so the flow always works.

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Button from "../components/ui/Button";
import { TextField, PasswordField } from "../components/auth/fields";
import { changeEmail, clearSession } from "../services/auth";

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

export default function Profile() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusEmail = searchParams.get("action") === "change-email";
  const emailRef = useRef(null);

  const [user, setUser] = useState(readStoredUser);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // "Change Email" from the avatar menu lands here ready to type.
  useEffect(() => {
    if (focusEmail) emailRef.current?.querySelector("input")?.focus();
  }, [focusEmail]);

  function onSubmit(e) {
    e.preventDefault();
    setNotice("");
    setError("");

    if (!EMAIL_RE.test(newEmail.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!currentPassword) {
      setError("Enter your current password to confirm the change.");
      return;
    }

    setSubmitting(true);
    changeEmail(newEmail.trim(), currentPassword)
      .then((body) => {
        setUser(readStoredUser() || user);
        setNewEmail("");
        setCurrentPassword("");
        setNotice(body.message || "Email updated.");
      })
      .catch((err) => setError(err.message || "Could not change the email."))
      .finally(() => setSubmitting(false));
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-heading font-semibold text-text-primary">Profile</h2>
        <p className="mt-1.5 text-body text-text-secondary">
          Your account details and sign-in email.
        </p>
      </div>

      {/* Account card */}
      <motion.section
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-card border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8"
      >
        <div className="flex flex-wrap items-center gap-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-elevated text-body font-semibold text-text-secondary">
            {initialsOf(user)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-section font-semibold text-text-primary">
              {user?.fullName || "LeakLens user"}
            </p>
            <p className="truncate text-small text-text-secondary">
              {user?.email || "—"}
            </p>
          </div>
          <div className="ml-auto">
            <Button variant="secondary" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Change email card */}
      <section className="rounded-card border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        <h3 className="text-section font-semibold text-text-primary">
          Change Email
        </h3>
        <p className="mt-2 text-small text-text-secondary">
          Update the email you use to sign in. Confirm with your current
          password.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-6 flex max-w-md flex-col gap-5">
          <div ref={emailRef}>
            <TextField
              label="New Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <PasswordField
            label="Current Password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          {error && (
            <p role="alert" className="rounded-control border border-danger/30 bg-danger/10 px-4 py-3 text-small text-danger">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="rounded-control border border-success/30 bg-success/10 px-4 py-3 text-small text-success">
              {notice}
            </p>
          )}

          <div>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Updating…" : "Update Email"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
