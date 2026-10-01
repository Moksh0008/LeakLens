// EmptyWorkspace.jsx — shared "no data yet" state for fresh accounts.
// Used by Home, Dashboard and Transactions until a CSV has been
// imported (real mode: DB has no rows; mock mode: no upload yet).

import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Button from "./ui/Button";
import { UploadIcon } from "./ui/Icons";

export default function EmptyWorkspace() {
  const reduce = useReducedMotion();

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      className="rounded-card border border-border bg-surface p-8 text-center shadow-[var(--shadow-card)]"
    >
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-card border border-border bg-surface-elevated text-accent">
        <UploadIcon size={20} />
      </span>
      <h2 className="mt-5 text-section font-semibold text-text-primary">
        Your workspace is empty
      </h2>
      <p className="mx-auto mt-2 max-w-md text-small text-text-secondary">
        Upload your CSV file to get analysis — LeakLens will surface price
        anomalies, missed discounts and other leakage as soon as your
        transactions are in.
      </p>
      <div className="mt-6 flex justify-center">
        <Link to="/import">
          <Button variant="primary" className="h-11 px-6">
            <UploadIcon size={15} />
            Upload CSV
          </Button>
        </Link>
      </div>
      <p className="mt-5 text-caption text-text-muted">
        New account? Head to Data Import and drop your procurement CSV.
      </p>
    </motion.section>
  );
}
