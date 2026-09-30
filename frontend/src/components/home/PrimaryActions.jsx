// PrimaryActions.jsx — "start here" guidance: import data first,
// or browse existing transactions. Clear, not oversized.

import { Link } from "react-router-dom";
import { useReducedMotion, motion } from "framer-motion";
import Button from "../ui/Button";
import { UploadIcon, ListIcon } from "../ui/Icons";

export default function PrimaryActions() {
  const reduce = useReducedMotion();
  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
      className="flex flex-col gap-6 rounded-card border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between sm:p-8"
    >
      <div className="max-w-lg">
        <h2 className="text-section font-semibold text-text-primary">
          Start with your procurement data
        </h2>
        <p className="mt-2 text-small text-text-secondary">
          Import historical transactions to identify pricing anomalies,
          supplier fragmentation and potential savings opportunities.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/import">
          <Button variant="primary">
            <UploadIcon size={15} />
            Import Procurement Data
          </Button>
        </Link>
        <Link to="/transactions">
          <Button variant="secondary">
            <ListIcon size={15} />
            View Transactions
          </Button>
        </Link>
      </div>
    </motion.section>
  );
}
