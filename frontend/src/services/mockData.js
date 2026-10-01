// mockData.js — realistic fake data so the frontend works BEFORE the backend.
//
// Every record follows the AGREED leakage object shape:
// { transactionId, product, supplier, quantity, actualPrice, benchmarkPrice,
//   potentialLeakage, severity, detectionType, reason }
// plus two extra fields the UI needs: `date` and `category`.
//
// A seeded random generator is used so the numbers are IDENTICAL on every
// reload — your demo screenshots and charts stay stable during judging.

import { leakageRate } from "../utils/aggregate";

// ---------- seeded random (mulberry32) ----------
function makeRng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = makeRng(20260101);

const pick = (arr) => arr[Math.floor(rng() * arr.length)];
const between = (min, max) => min + rng() * (max - min);
const intBetween = (min, max) => Math.floor(between(min, max + 1));

// ---------- reference data ----------
const SUPPLIERS = [
  "ABC Ltd", "Zenith Traders", "GlobalTech Supplies", "Meridian Industrial",
  "Sharma & Co", "Orbit Office Solutions", "NovaParts Pvt Ltd", "Vertex Systems",
  "PrimeSource India", "EastBridge Enterprises",
];

const CATEGORIES = [
  "IT Hardware", "Office Supplies", "Raw Materials", "Logistics",
  "Facilities", "Professional Services",
];

const PRODUCTS = {
  "IT Hardware": [
    ["Laptop", 50000, 90000],
    ["Desktop Monitor", 8000, 18000],
    ["Laser Printer", 14000, 35000],
    ["Networking Switch", 12000, 40000],
    ["External SSD 1TB", 6000, 12000],
  ],
  "Office Supplies": [
    ["A4 Paper (ream)", 220, 400],
    ["Office Chair", 4500, 12000],
    ["Whiteboard", 2500, 6000],
    ["Desk Lamp", 800, 2200],
    ["Stapler Set", 300, 900],
  ],
  "Raw Materials": [
    ["Steel Sheet (per tonne)", 45000, 75000],
    ["Aluminium Ingot (per tonne)", 120000, 210000],
    ["Industrial Adhesive (drum)", 9000, 22000],
    ["Copper Wire (per km)", 55000, 95000],
  ],
  Logistics: [
    ["Freight (per shipment)", 15000, 60000],
    ["Warehouse Rental (monthly)", 80000, 250000],
    ["Last-mile Delivery Contract", 25000, 90000],
  ],
  Facilities: [
    ["HVAC Maintenance Contract", 40000, 120000],
    ["Security Services (monthly)", 60000, 150000],
    ["Cleaning Supplies (bulk)", 5000, 15000],
  ],
  "Professional Services": [
    ["Legal Retainer (monthly)", 50000, 150000],
    ["Audit Service", 100000, 300000],
    ["IT Support Contract", 35000, 100000],
  ],
};

const DETECTION_TYPES = [
  "PRICE_ANOMALY",
  "SUPPLIER_PRICE_VARIANCE",
  "PRICE_SPIKE",
  "POSSIBLE_DUPLICATE",
  "UNUSUAL_QUANTITY",
];

// ---------- transaction generation ----------
function randomDate() {
  // Feb – Sep 2026
  const start = new Date(2026, 1, 1).getTime();
  const end = new Date(2026, 8, 28).getTime();
  return new Date(start + rng() * (end - start));
}

function buildTransaction(i) {
  const category = pick(CATEGORIES);
  const [product, baseMin, baseMax] = pick(PRODUCTS[category]);
  const benchmarkPrice = Math.round(between(baseMin, baseMax) / 10) * 10;
  const supplier = pick(SUPPLIERS);
  const quantity = intBetween(2, 40);
  const date = randomDate();

  // Most transactions are normal (at or below benchmark → zero leakage).
  // ~15% are suspicious with a 1.2x–1.6x markup. This mix keeps the
  // overall leakage rate in a believable 4–7% band for the demo.
  const isFlagged = rng() < 0.15;
  const factor = isFlagged ? between(1.08, 1.6) : between(0.88, 1.0);
  const actualPrice = Math.round((benchmarkPrice * factor) / 10) * 10;

  const overpaymentPerUnit = Math.max(0, actualPrice - benchmarkPrice);
  const potentialLeakage = Math.round(overpaymentPerUnit * quantity);

  // Severity from the amount — consistent everywhere it is displayed.
  const leakagePerUnitPct = benchmarkPrice ? (overpaymentPerUnit / benchmarkPrice) * 100 : 0;
  let severity = "LOW";
  if (potentialLeakage > 2000000 || leakagePerUnitPct > 45) severity = "HIGH";
  else if (potentialLeakage > 400000 || leakagePerUnitPct > 20) severity = "MEDIUM";

  const detectionType = isFlagged
    ? pick(DETECTION_TYPES)
    : "NONE"; // clean transactions have no detection type

  const reason = buildReason({ detectionType, leakagePerUnitPct, quantity, benchmarkPrice, date });

  return {
    transactionId: `TX${1000 + i}`,
    product,
    supplier,
    category,
    quantity,
    actualPrice,
    benchmarkPrice,
    potentialLeakage,
    severity,
    detectionType,
    reason,
    date: date.toISOString().slice(0, 10),
    status: severity === "HIGH" ? "Under review" : severity === "MEDIUM" ? "Flagged" : "Monitor",
  };
}

function buildReason({ detectionType, leakagePerUnitPct, quantity, benchmarkPrice, date }) {
  const pct = Math.round(leakagePerUnitPct);
  switch (detectionType) {
    case "PRICE_ANOMALY":
      return `Unit price is ${pct}% above the historical benchmark (₹${benchmarkPrice.toLocaleString("en-IN")}) for this product.`;
    case "SUPPLIER_PRICE_VARIANCE":
      return `This supplier charges ${pct}% more than the median price paid across comparable suppliers for the same item.`;
    case "PRICE_SPIKE":
      return `Price jumped ${pct}% versus the supplier's own recent transactions without a recorded contract change.`;
    case "POSSIBLE_DUPLICATE":
      return `Near-identical purchase (same product, supplier and amount) exists within a 7-day window — possible double billing.`;
    case "UNUSUAL_QUANTITY":
      return `Order quantity (${quantity} units) is well outside the normal range for this product, suggesting possible over-ordering.`;
    default:
      return "No leakage pattern detected — transaction is within expected price and quantity ranges.";
  }
}

const TOTAL_ROWS = 420;

export const mockTransactions = Array.from({ length: TOTAL_ROWS }, (_, i) =>
  buildTransaction(i),
);

export const mockLeakage = mockTransactions.filter((t) => t.potentialLeakage > 0);

// ---------- GET /api/dashboard shape ----------
export function buildMockDashboard() {
  const totalProcurement = mockTransactions.reduce(
    (sum, t) => sum + t.actualPrice * t.quantity,
    0,
  );
  const potentialLeakage = mockLeakage.reduce(
    (sum, t) => sum + t.potentialLeakage,
    0,
  );
  const suppliers = new Set(mockTransactions.map((t) => t.supplier));

  // Missed savings: illustrative 25% of leakage would be recoverable
  // through negotiation/consolidation.
  const missedSavings = Math.round(potentialLeakage * 0.25);

  return {
    totalProcurement,
    potentialLeakage,
    missedSavings,
    transactionsAnalyzed: mockTransactions.length,
    flaggedTransactions: mockLeakage.length,
    suppliersAnalyzed: suppliers.size,
    leakageRate: Number(leakageRate(potentialLeakage, totalProcurement).toFixed(1)),
    openInvestigations: mockLeakage.filter((t) => t.severity === "HIGH").length,
    // Illustrative period-over-period movement for KPI captions.
    leakageChangePct: 14.2,
    spendChangePct: 8.1,
  };
}

// ---------- Monthly spend vs leakage series (derived) ----------
// Accepts an optional transactions list so REAL backend data can be run
// through the same derivation (integration: api.js real mode).
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function buildSpendLeakageTrend(transactions = mockTransactions) {
  const months = new Map();
  for (const t of transactions) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const cur = months.get(key) || { key, spend: 0, leakage: 0 };
    // totalAmount exists on real backend rows; mock rows derive it.
    // (actualPrice is only present on flagged rows, so it can't be used here.)
    const amount = t.totalAmount ?? t.unitPrice * t.quantity;
    cur.spend += Number.isFinite(amount) ? amount : 0;
    cur.leakage += t.potentialLeakage ?? 0;
    months.set(key, cur);
  }
  return [...months.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ key, spend, leakage }) => {
      const [y, m] = key.split("-");
      return {
        month: `${MONTH_NAMES[Number(m) - 1]} ${y.slice(2)}`,
        spend: Math.round(spend),
        leakage: Math.round(leakage),
      };
    });
}

// ---------- Supplier consolidation opportunities ----------
// Products bought from multiple suppliers at differing prices.
export function buildConsolidationOpportunities(transactions = mockTransactions) {
  const byProduct = new Map();
  for (const t of transactions) {
    const cur = byProduct.get(t.product) || { product: t.product, category: t.category, suppliers: new Map(), spend: 0 };
    cur.suppliers.set(t.supplier, (cur.suppliers.get(t.supplier) || 0) + 1);
    cur.spend += t.actualPrice * t.quantity;
    byProduct.set(t.product, cur);
  }
  return [...byProduct.values()]
    .filter((p) => p.suppliers.size >= 3)
    .map((p) => ({
      product: p.product,
      category: p.category,
      supplierCount: p.suppliers.size,
      spend: p.spend,
      // Illustrative 6% saving from consolidating to one negotiated supplier.
      potentialSaving: Math.round(p.spend * 0.06),
    }))
    .sort((a, b) => b.potentialSaving - a.potentialSaving)
    .slice(0, 5);
}

// ---------- Contract / discount exceptions (illustrative) ----------
// Accepts an optional leakage list so REAL backend findings can be used
// through the same derivation (integration: api.js real mode).
export function buildContractExceptions(leakage = mockLeakage) {
  return leakage
    .filter((t) => t.detectionType === "PRICE_ANOMALY" || t.detectionType === "SUPPLIER_PRICE_VARIANCE")
    .slice(0, 5)
    .map((t) => ({
      transactionId: t.transactionId,
      supplier: t.supplier,
      product: t.product,
      type: t.detectionType === "PRICE_ANOMALY" ? "Out-of-Contract" : "Missed Discount",
      potentialImpact: t.potentialLeakage,
    }));
}
