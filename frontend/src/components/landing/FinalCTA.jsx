// FinalCTA.jsx — the closing ask.

import { Link } from "react-router-dom";
import { Reveal } from "./motion";
import Button from "../ui/Button";
import { isSignedIn } from "../../services/auth";

export default function FinalCTA() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-heading text-text-primary sm:text-3xl">
            Turn procurement data into actionable insight.
          </h2>
          <p className="mt-4 text-body text-text-secondary">
            Consolidate spend, benchmark prices, identify exceptions and
            investigate potential leakage from one platform.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to={isSignedIn() ? "/home" : "/signup"}>
              <Button variant="primary" size="md" className="h-11 px-8">
                {isSignedIn() ? "Open Your Workspace" : "Get Started"}
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
