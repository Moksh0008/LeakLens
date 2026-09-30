// Badges.jsx — COMPATIBILITY SHIM.
// The dashboard pages (built earlier) import SeverityBadge / DetectionBadge /
// DETECTION_LABELS from this file. They now delegate to the design-system
// Badge so there is one source of truth. Once the dashboard is migrated to
// the new tokens, delete this file and import Badge directly.

import Badge from "./Badge";

export const DETECTION_LABELS = {
  PRICE_ANOMALY: "Price Anomaly",
  SUPPLIER_PRICE_VARIANCE: "Supplier Price Variance",
  PRICE_SPIKE: "Price Spike",
  POSSIBLE_DUPLICATE: "Possible Duplicate",
  UNUSUAL_QUANTITY: "Unusual Quantity",
  NONE: "Clean",
};

export function SeverityBadge({ severity, size = "sm" }) {
  const sizeClass = size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]";
  return (
    <Badge variant={severity} dot className={sizeClass}>
      {severity || "—"}
    </Badge>
  );
}

export function DetectionBadge({ type }) {
  return (
    <Badge variant={type === "NONE" ? "neutral" : "accent"}>
      {DETECTION_LABELS[type] || type}
    </Badge>
  );
}
