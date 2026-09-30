// SignupForm.jsx — account creation form.
// Full client-side validation (name, email, organization, match check),
// role select, show/hide passwords, and a brief "Creating account…"
// state before navigating to /login. Submission goes through
// services/auth.js — replace that file's body with the real API later.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { TextField, PasswordField, SelectField } from "./fields";
import Button from "../ui/Button";
import { signUp } from "../../services/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ["Procurement", "Finance", "Management", "Analyst", "Other"];

export default function SignupForm() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const initial = {
    name: "",
    email: "",
    organization: "",
    role: ROLES[0],
    password: "",
    confirm: "",
  };
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function set(field, value) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => {
      const next = { ...e, [field]: undefined };
      // Re-validate confirm as the user types either password field.
      if ((field === "password" || field === "confirm") && next.confirm) {
        const password = field === "password" ? value : values.password;
        const confirm = field === "confirm" ? value : values.confirm;
        next.confirm =
          confirm && password !== confirm ? "Passwords do not match." : undefined;
      }
      return next;
    });
  }

  function validate() {
    const next = {};
    if (!values.name.trim()) next.name = "Full name is required.";
    if (!values.email.trim()) next.email = "Work email is required.";
    else if (!EMAIL_RE.test(values.email)) next.email = "Enter a valid email address.";
    if (!values.organization.trim()) next.organization = "Organization is required.";
    if (!values.password) next.password = "Password is required.";
    else if (values.password.length < 8) next.password = "Use at least 8 characters.";
    if (!values.confirm) next.confirm = "Confirm your password.";
    else if (values.password !== values.confirm)
      next.confirm = "Passwords do not match.";
    return next;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    try {
      await signUp({
        name: values.name,
        email: values.email,
        organization: values.organization,
        role: values.role,
        password: values.password,
      });
      navigate("/login");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div>
        <h2 className="text-heading font-semibold text-text-primary">
          Create your LeakLens account
        </h2>
        <p className="mt-2 text-body text-text-secondary">
          Start turning procurement data into actionable intelligence.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <TextField
          label="Full Name"
          autoComplete="name"
          placeholder="Alex Fernandes"
          value={values.name}
          error={errors.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <TextField
          label="Work Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={values.email}
          error={errors.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <TextField
          label="Organization"
          autoComplete="organization"
          placeholder="Company Pvt Ltd"
          value={values.organization}
          error={errors.organization}
          onChange={(e) => set("organization", e.target.value)}
        />
        <SelectField
          label="Role"
          options={ROLES}
          value={values.role}
          onChange={(e) => set("role", e.target.value)}
        />
        <PasswordField
          label="Password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={values.password}
          error={errors.password}
          onChange={(e) => set("password", e.target.value)}
        />
        <PasswordField
          label="Confirm Password"
          autoComplete="new-password"
          placeholder="Re-enter password"
          value={values.confirm}
          error={errors.confirm}
          onChange={(e) => set("confirm", e.target.value)}
        />
      </div>

      <Button type="submit" variant="primary" disabled={submitting} className="h-11 w-full">
        {submitting ? (
          <motion.span
            animate={reduce ? undefined : { opacity: [1, 0.55, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          >
            Creating account…
          </motion.span>
        ) : (
          "Create Account"
        )}
      </Button>

      <div className="flex flex-col items-center gap-3 border-t border-border pt-6">
        <p className="text-small text-text-secondary">
          Already have an account?{" "}
          <Link to="/login" className="text-accent transition-colors hover:text-accent-strong">
            Sign in
          </Link>
        </p>
        <Link to="/" className="text-caption text-text-muted transition-colors hover:text-text-secondary">
          ← Back to LeakLens
        </Link>
      </div>
    </form>
  );
}
