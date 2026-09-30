// AuthPlaceholder.jsx — temporary pages for /login and /signup.
// Authentication arrives in the next task; these exist only so the
// navbar/CTA links resolve instead of 404ing.

import { Link } from "react-router-dom";
import { LensLogo } from "../components/ui/Icons";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function AuthPlaceholder({ mode = "login" }) {
  const isLogin = mode === "login";
  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5" aria-label="LeakLens home">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-elevated text-accent">
              <LensLogo size={19} />
            </span>
            <span className="text-[17px] font-semibold tracking-tight">LeakLens</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-sm p-8 text-center">
          <p className="overline">{isLogin ? "Log in" : "Get started"}</p>
          <h1 className="mt-2 text-heading">
            {isLogin ? "Welcome back" : "Create your workspace"}
          </h1>
          <p className="mt-3 text-small text-text-secondary">
            Authentication is coming in the next milestone. This placeholder
            keeps the product flow navigable in the meantime.
          </p>
          <Link to="/dashboard" className="mt-6 block">
            <Button variant="secondary" className="w-full">
              Continue to dashboard preview
            </Button>
          </Link>
          <p className="mt-4 text-caption text-text-muted">
            <Link to="/" className="hover:text-text-secondary">← Back to home</Link>
          </p>
        </Card>
      </main>
    </div>
  );
}
