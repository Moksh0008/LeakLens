// aggregate.js — pure functions that turn a leakage array into chart data.
// They work on ANY array that follows the agreed leakage object shape,
// so they will keep working when the real backend arrives.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Group leakage by any field ("supplier", "category", ...).
 * Returns [{ name: "ABC Ltd", value: 300000, count: 4 }] sorted by value desc.
 */
export function groupLeakageBy(leakage, field) {
  const groups = new Map();
  for (const item of leakage) {
    const key = item[field] || "Unknown";
    const current = groups.get(key) || { name: key, value: 0, count: 0 };
    current.value += item.potentialLeakage || 0;
    current.count += 1;
    groups.set(key, current);
  }
  return [...groups.values()].sort((a, b) => b.value - a.value);
}

/** Top N groups, everything else folded into "Other" — keeps charts readable. */
export function topGroups(groups, n = 8) {
  if (groups.length <= n) return groups;
  const top = groups.slice(0, n);
  const rest = groups.slice(n);
  const otherValue = rest.reduce((sum, g) => sum + g.value, 0);
  const otherCount = rest.reduce((sum, g) => sum + g.count, 0);
  return [...top, { name: "Other", value: otherValue, count: otherCount }];
}

/** [{ name: "LOW", value, count }, MEDIUM, HIGH] — always in that order. */
export function getSeverityDistribution(leakage) {
  const order = ["LOW", "MEDIUM", "HIGH"];
  return order.map((name) => {
    const items = leakage.filter((l) => l.severity === name);
    return {
      name,
      value: items.reduce((sum, l) => sum + (l.potentialLeakage || 0), 0),
      count: items.length,
    };
  });
}

/** Monthly leakage trend → [{ month: "Sep 25", value, count }] chronological. */
export function getLeakageTrend(leakage) {
  const groups = new Map();
  for (const item of leakage) {
    if (!item.date) continue;
    const d = new Date(item.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const current = groups.get(key) || { key, value: 0, count: 0 };
    current.value += item.potentialLeakage || 0;
    current.count += 1;
    groups.set(key, current);
  }
  return [...groups.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ key, value, count }) => {
      const [year, month] = key.split("-");
      return { month: `${MONTHS[Number(month) - 1]} ${year.slice(2)}`, value, count };
    });
}

/** leakage ÷ total × 100, safe against divide-by-zero. */
export function leakageRate(potentialLeakage, totalProcurement) {
  if (!totalProcurement) return 0;
  return (potentialLeakage / totalProcurement) * 100;
}

/**
 * Supplier price variance — for each supplier, the average spread between
 * the unit prices they charge and the median unit price for the same products.
 * Returns [{ supplier, variancePct }] sorted desc, top N.
 */
export function getSupplierPriceVariance(transactions, topN = 7) {
  // Median unit price per product across all suppliers.
  const byProduct = new Map();
  for (const t of transactions) {
    if (!byProduct.has(t.product)) byProduct.set(t.product, []);
    byProduct.get(t.product).push(t.actualPrice);
  }
  const median = new Map();
  for (const [product, prices] of byProduct) {
    const sorted = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    median.set(product, sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2);
  }

  // Per-supplier average premium vs product median.
  const acc = new Map();
  for (const t of transactions) {
    const m = median.get(t.product) || t.actualPrice;
    const cur = acc.get(t.supplier) || { sum: 0, n: 0 };
    cur.sum += ((t.actualPrice - m) / m) * 100;
    cur.n += 1;
    acc.set(t.supplier, cur);
  }
  return [...acc.entries()]
    .map(([supplier, { sum, n }]) => ({ supplier, variancePct: Number((sum / n).toFixed(1)) }))
    .sort((a, b) => b.variancePct - a.variancePct)
    .slice(0, topN);
}
