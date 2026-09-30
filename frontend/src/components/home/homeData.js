// homeData.js — mock content for the authenticated Home page.
// Frontend-only, isolated from services/ — when the backend provides a
// /api/home endpoint (or Member 2's endpoints cover these), swap the
// constants here for fetched data and nothing else changes.
//
// All figures are illustrative demo values.

// TODO(session): replace with the signed-in user's profile.
export const HOME_USER = { name: "Alex" };

export const PERIOD_LABEL = "Feb – Sep 2026 · demo data";

/** Neutral time-based greeting. */
export function greetingForHour(hour = new Date().getHours()) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ---------- Section 1 · Quick snapshot ----------
export const SNAPSHOT = [
  {
    label: "Total Procurement Spend",
    value: 585800000,
    context: "420 transactions analyzed",
    format: "compactINR",
  },
  {
    label: "Potential Leakage",
    value: 25500000,
    context: "4.4% of analyzed spend",
    emphasis: true,
    format: "compactINR",
  },
  {
    label: "Potential Missed Savings",
    value: 6400000,
    context: "recoverable via negotiation",
    format: "compactINR",
  },
  {
    label: "Transactions Requiring Investigation",
    value: 67,
    context: "20 high-severity findings",
    format: "number",
  },
];

// ---------- Section 3 · What LeakLens can identify ----------
export const IDENTIFY_FEATURES = [
  {
    icon: "price",
    title: "Price Anomalies",
    body: "Identify purchases priced significantly above relevant benchmarks.",
  },
  {
    icon: "fragmentation",
    title: "Supplier Fragmentation",
    body: "Find categories where purchasing is spread across multiple suppliers.",
  },
  {
    icon: "contract",
    title: "Contract Exceptions",
    body: "Compare actual purchases with negotiated or expected terms.",
  },
  {
    icon: "pattern",
    title: "Unusual Procurement Patterns",
    body: "Surface transactions that may require further investigation.",
  },
];

// ---------- Section 4 · Recent procurement activity ----------
export const RECENT_ACTIVITY = [
  {
    transactionId: "TX1045",
    product: "Laptop",
    supplier: "ABC Ltd",
    amount: 1300000,
    finding: "PRICE_ANOMALY",
    severity: "HIGH",
  },
  {
    transactionId: "TX1042",
    product: "Industrial Printer",
    supplier: "NovaParts Pvt Ltd",
    amount: 420000,
    finding: "SUPPLIER_PRICE_VARIANCE",
    severity: "MEDIUM",
  },
  {
    transactionId: "TX1038",
    product: "Office Chairs",
    supplier: "Sharma & Co",
    amount: 185000,
    finding: "Missed Discount",
    severity: "LOW",
  },
  {
    transactionId: "TX1034",
    product: "Network Equipment",
    supplier: "PrimeSource India",
    amount: 760000,
    finding: "Out of Contract",
    severity: "HIGH",
  },
];

// ---------- Section 5 · Requires attention ----------
export const REQUIRES_ATTENTION = [
  {
    issue: "Potential Excess Cost",
    product: "Laptop",
    evidence: "Priced ₹15,000 above the ₹50,000 benchmark per unit · 20 units",
    impact: 300000,
    severity: "HIGH",
  },
  {
    issue: "Missed Discount",
    product: "Industrial Equipment",
    evidence: "Purchase price exceeds the negotiated discount tier by 12%",
    impact: 180000,
    severity: "MEDIUM",
  },
  {
    issue: "Out-of-Contract Purchase",
    product: "Network Equipment",
    evidence: "No active contract on record for this supplier",
    impact: 125000,
    severity: "HIGH",
  },
];

// ---------- Section 6 · Explore ----------
export const EXPLORE_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Transactions", to: "/transactions" },
  { label: "Price Benchmarking", to: "/price-benchmarking" },
  { label: "Supplier Analysis", to: "/supplier-analysis" },
  { label: "Contracts & Discounts", to: "/contracts" },
  { label: "Leakage Analysis", to: "/leakage" },
];
