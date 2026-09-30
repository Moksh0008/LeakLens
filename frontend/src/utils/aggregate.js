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
