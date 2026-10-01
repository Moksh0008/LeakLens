// LoginForm.jsx — sign-in form.
// Client-side validation, calm inline errors, show/hide password,
// remember-me, and a brief "Signing in…" state before navigating.
// Submission goes through services/auth.js — swap that file for the
// real API when Member 3 lands; this component does not change.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { TextField, PasswordField } from "./fields";
import Button from "../ui/Button";
import { signIn } from "../../services/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [values, setValues] = useState({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  function set(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    // Clear the field's error as the user fixes it.
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  }

  function validate() {
    const next = {};
    if (!values.email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(values.email)) next.email = "Enter a valid email address.";
    if (!values.password) next.password = "Password is required.";
    return next;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    setFormError("");
    try {
      await signIn({ email: values.email, password: values.password });
      // TODO(session): replace with the real post-login destination
      // (e.g. from Member 3's API response) once auth lands.
      navigate("/home");
    } catch (err) {
      setFormError(err.message || "Could not sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div>
        <h2 className="text-heading font-semibold text-text-primary">Welcome back</h2>
        <p className="mt-2 text-body text-text-secondary">
          Sign in to continue to LeakLens.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <TextField
          label="Work Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={values.email}
          error={errors.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          error={errors.password}
          onChange={(e) => set("password", e.target.value)}
        />
      </div>

      {/* Remember me / forgot password */}
      <div className="flex items-center justify-between gap-4">
        <label className="flex cursor-pointer items-center gap-2.5 text-small text-text-secondary">
          <input
            type="checkbox"
            checked={values.remember}
            onChange={(e) => set("remember", e.target.checked)}
            className="h-4 w-4 rounded border-border bg-surface-elevated accent-[#4f7ff7]"
          />
          Remember me
        </label>
        <button
          type="button"
          onClick={() => setShowReset((v) => !v)}
          aria-expanded={showReset}
          className="text-small text-accent transition-colors hover:text-accent-strong"
        >
          Forgot password?
        </button>
      </div>

      {/* Inline reset request — mock until the backend provides the flow */}
      {showReset && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 rounded-control border border-border bg-surface-elevated p-4"
        >
          <p className="text-small text-text-secondary">
            Enter your work email and we&apos;ll send reset instructions.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => {
                setResetEmail(e.target.value);
                setResetSent(false);
              }}
              placeholder="you@company.com"
              aria-label="Reset email"
              className="h-10 flex-1 rounded-control border border-border bg-surface px-3 text-small text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent"
            />
            <Button variant="secondary" size="sm" type="button" onClick={() => setResetSent(true)}>
              Send link
            </Button>
          </div>
          {resetSent && (
            <p role="status" className="text-caption text-success">
              If an account exists for {resetEmail || "that address"}, a reset link is on its way.
            </p>
          )}
        </motion.div>
      )}

      {/* Server-side error (wrong password, backend down, …) */}
      {formError && (
        <p role="alert" className="rounded-control border border-danger/30 bg-danger/10 px-4 py-3 text-small text-danger">
          {formError}
        </p>
      )}

      <Button type="submit" variant="primary" disabled={submitting} className="h-11 w-full">
        {submitting ? (
          <motion.span
            animate={reduce ? undefined : { opacity: [1, 0.55, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            Signing in…
          </motion.span>
        ) : (
          "Sign In"
        )}
      </Button>

      <div className="flex flex-col items-center gap-3 border-t border-border pt-6">
        <p className="text-small text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="text-accent transition-colors hover:text-accent-strong">
            Create account
          </Link>
        </p>
        <Link to="/" className="text-caption text-text-muted transition-colors hover:text-text-secondary">
          ← Back to LeakLens
        </Link>
      </div>
    </form>
  );
}
