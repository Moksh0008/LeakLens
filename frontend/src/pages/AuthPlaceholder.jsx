// AuthPlaceholder.jsx — split-screen authentication layouts for /login and
// /signup. Forms are placeholder-only until the auth milestone; the shell,
// inputs and CTAs already use the enterprise design system.

import { Link } from "react-router-dom";
import { LensLogo } from "../components/ui/Icons";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const VALUE_PROPS = [
  "Benchmark prices across suppliers and products",
  "Surface potential leakage with transaction evidence",
  "Consolidate fragmented purchasing into negotiated savings",
];

export default function AuthPlaceholder({ mode = "login" }) {
  const isLogin = mode === "login";

  return (
    <div className="grid min-h-screen bg-background text-text-primary lg:grid-cols-2">
      {/* ---------- Left: brand + value proposition ---------- */}
      <div className="relative hidden flex-col justify-between border-r border-border bg-background-2 p-10 lg:flex">
        {/* intentional calm: no decorative gradients */}
        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-elevated text-accent">
            <LensLogo size={19} />
          </span>
          <span className="text-[17px] font-semibold tracking-tight">LeakLens</span>
        </Link>

        <div className="relative max-w-md">
          <p className="overline">Procurement Spend Intelligence</p>
          <h1 className="mt-3 text-heading">
            {isLogin ? "Welcome back." : "Start finding leakage."}
          </h1>
          <ul className="mt-6 flex flex-col gap-3">
            {VALUE_PROPS.map((v) => (
              <li key={v} className="flex items-start gap-2.5 text-small text-text-secondary">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {v}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-caption text-text-muted">
          FINATHON 2026 · FIN-04 — illustrative demo data only
        </p>
      </div>

      {/* ---------- Right: form ---------- */}
      <div className="flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-sm p-8">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-elevated text-accent">
              <LensLogo size={16} />
            </span>
            <span className="font-semibold">LeakLens</span>
          </div>

          <p className="overline">{isLogin ? "Log in" : "Get started"}</p>
          <h2 className="mt-1.5 text-section font-semibold text-text-primary">
            {isLogin ? "Access your workspace" : "Create your workspace"}
          </h2>

          <form className="mt-6 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            {!isLogin && (
              <Field label="Full name" type="text" placeholder="Alex Fernandes" />
            )}
            <Field label="Work email" type="email" placeholder="you@company.com" />
            <Field label="Password" type="password" placeholder="••••••••" />

            <Button variant="primary" type="submit" className="mt-1 h-10 w-full">
              {isLogin ? "Log in" : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-caption text-text-muted">
            {isLogin ? (
              <>New to LeakLens? <Link to="/signup" className="text-accent hover:underline">Get started</Link></>
            ) : (
              <>Already have an account? <Link to="/login" className="text-accent hover:underline">Log in</Link></>
            )}
          </p>
          <p className="mt-4 border-t border-border pt-4 text-center text-caption text-text-muted">
            <Link to="/dashboard" className="hover:text-text-secondary">Continue to dashboard preview →</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, type, placeholder }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="overline">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="h-10 rounded-control border border-border bg-surface-elevated px-3 text-small text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent"
      />
    </label>
  );
}
