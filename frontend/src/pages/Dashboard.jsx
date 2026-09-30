// Dashboard.jsx — Overview page.
// Answers in order: how much are we spending, where might money be
// leaking, why, who is involved, what is the impact, what needs review.
// Layout follows the enterprise spec: KPI row + four analytical rows.

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getConsolidationOpportunities,
  getContractExceptions,
  getDashboard,
  getLeakage,
  getSpendLeakageTrend,
} from "../services/api";
import { useFetch } from "../hooks/useFetch";
import {
  getSeverityDistribution,
  getSupplierPriceVariance,
  groupLeakageBy,
  topGroups,
} from "../utils/aggregate";
import { formatCompactINR, formatINR } from "../utils/format";
import KpiCards from "../components/dashboard/KpiCards";
import SectionCard, { HeaderTotals } from "../components/dashboard/SectionCard";
import HighImpactTable from "../components/dashboard/HighImpactTable";
import SpendLeakageChart from "../components/charts/SpendLeakageChart";
import SeverityDonut from "../components/charts/SeverityDonut";
import LeakageByBar from "../components/charts/LeakageByBar";
import PriceVarianceChart from "../components/charts/PriceVarianceChart";
import { ErrorPanel, LoadingPanel } from "../components/ui/States";
import { DETECTION_LABELS } from "../components/ui/Badges";

export default function Dashboard() {
  const navigate = useNavigate();

  const dashboard = useFetch(getDashboard, []);
  const leakage = useFetch(getLeakage, []);
  const trend = useFetch(getSpendLeakageTrend, []);
  const consolidation = useFetch(getConsolidationOpportunities, []);
  const contractExc = useFetch(getContractExceptions, []);

  const loading =
    dashboard.loading || leakage.loading || trend.loading;
  const error = dashboard.error || leakage.error || trend.error;
  const refetch = () => {
    dashboard.refetch();
    leakage.refetch();
    trend.refetch();
  };

  const charts = useMemo(() => {
    const items = leakage.data || [];
    const transactions = leakage.data || []; // mock dataset is one array
    return {
      bySupplier: topGroups(groupLeakageBy(items, "supplier"), 10),
      byCategory: topGroups(groupLeakageBy(items, "category"), 6),
      severity: getSeverityDistribution(items),
      variance: getSupplierPriceVariance(transactions, 7),
    };
  }, [leakage.data]);

  if (loading) return <LoadingPanel label="Crunching procurement data…" />;
  if (error) return <ErrorPanel message={error.message} onRetry={refetch} />;

  const d = dashboard.data;

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
      {/* Page title + period filter */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-heading text-text-primary">Procurement Overview</h2>
          <p className="mt-0.5 text-small text-text-secondary">
            Spend, leakage and investigation status across all analyzed records
          </p>
        </div>
        <span className="tnum rounded-control border border-border bg-surface px-3 py-1.5 text-caption text-text-secondary">
          Feb – Sep 2026 · illustrative demo data
        </span>
      </div>

      {/* ROW 1 — six KPIs */}
      <KpiCards dashboard={d} />

      {/* ROW 2 — spend vs leakage + severity */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SectionCard
          title="Spend vs Potential Leakage"
          subtitle="Monthly procurement spend and flagged leakage"
          className="xl:col-span-2"
          delay={0.05}
        >
          <SpendLeakageChart data={trend.data || []} />
        </SectionCard>

        <SectionCard
          title="Leakage Severity"
          subtitle="Flagged amount by severity"
          delay={0.1}
        >
          <SeverityDonut data={charts.severity} />
        </SectionCard>
      </div>

      {/* ROW 3 — category + supplier variance */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard
          title="Leakage by Category"
          subtitle="Where spend leaks most"
          delay={0.12}
        >
          <LeakageByBar data={charts.byCategory} height={260} />
        </SectionCard>

        <SectionCard
          title="Supplier Price Variance"
          subtitle="Avg. premium vs median product price"
          delay={0.15}
        >
          <PriceVarianceChart data={charts.variance} height={260} />
        </SectionCard>
      </div>

      {/* ROW 4 — high-impact investigation table */}
      <SectionCard
        title="High-Impact Transactions"
        subtitle="Largest potential leakage — click a row to investigate"
        delay={0.18}
        action={<HeaderTotals value={d.potentialLeakage} count={d.flaggedTransactions} />}
      >
        <HighImpactTable
          items={leakage.data || []}
          limit={8}
          onInvestigate={(t) =>
            navigate("/investigation", { state: { transactionId: t.transactionId } })
          }
        />
      </SectionCard>

      {/* ROW 5 — consolidation + contract exceptions */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SectionCard
          title="Supplier Consolidation Opportunities"
          subtitle="Products sourced from many suppliers — illustrative 6% saving"
          delay={0.2}
        >
          <MiniTable
            head={["Product", "Suppliers", "Spend", "Potential Saving"]}
            rows={(consolidation.data || []).map((c) => [
              <span key="p" className="text-text-primary">{c.product}</span>,
              <span key="s" className="tnum">{c.supplierCount}</span>,
              <span key="sp" className="tnum">{formatCompactINR(c.spend)}</span>,
              <span key="sv" className="tnum font-medium text-success">
                {formatCompactINR(c.potentialSaving)}
              </span>,
            ])}
            empty="No consolidation opportunities in this dataset."
          />
        </SectionCard>

        <SectionCard
          title="Contract & Discount Exceptions"
          subtitle="Purchases outside expected terms"
          delay={0.22}
        >
          <MiniTable
            head={["Transaction", "Supplier", "Exception", "Potential Impact"]}
            rows={(contractExc.data || []).map((e) => [
              <span key="t" className="tnum text-text-primary">{e.transactionId}</span>,
              <span key="s">{e.supplier}</span>,
              <span key="ty" className="text-warning">
                {e.type === "Out-of-Contract" ? "Out-of-Contract" : "Missed Discount"}
              </span>,
              <span key="i" className="tnum font-medium text-danger">
                {formatCompactINR(e.potentialImpact)}
              </span>,
            ])}
            empty="No contract exceptions detected."
          />
        </SectionCard>
      </div>

      <p className="pb-2 text-caption text-text-muted">
        Detection types: {Object.values(DETECTION_LABELS).slice(0, 5).join(" · ")} — illustrative demo data, not real company figures.
      </p>
    </div>
  );
}

/** Dense enterprise table used by row-5 panels. */
function MiniTable({ head, rows, empty }) {
  if (!rows.length) {
    return <p className="py-8 text-center text-small text-text-muted">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-small">
        <thead>
          <tr className="border-b border-border text-caption text-text-muted">
            {head.map((h, i) => (
              <th key={h} className={`pb-2 ${i > 0 ? "text-right" : ""} font-medium uppercase tracking-wide`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0 hover:bg-surface-hover/60">
              {cells.map((c, j) => (
                <td key={j} className={`py-2.5 ${j > 0 ? "text-right" : ""} text-text-secondary`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
