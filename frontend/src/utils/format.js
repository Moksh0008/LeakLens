// format.js — every money / number / date format lives here.
// If judges read a different format on two pages, we fix it in ONE place.

const inrFull = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const plainNumber = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

/** ₹25,40,000 — full Indian grouping (use in detail views) */
export function formatINR(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `₹${inrFull.format(value)}`;
}

/** ₹25.4M — compact (use in KPI cards, chart axes). Pass a symbol to
 * override the default ₹ (Settings → Currency display). */
export function formatCompactINR(value, symbol = "₹") {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${symbol}${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${symbol}${(value / 1_000).toFixed(0)}K`;
  return `${symbol}${value}`;
}

/** 10,420 */
export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return plainNumber.format(value);
}

/** 7.3 (number) → "7.3%" */
export function formatPercent(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

/** "2026-03-14" → "14 Mar 2026" */
export function formatDate(isoDate) {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
