// Dashboard.jsx — Overview page.
// Order answers: how much are we spending, how much leakage, what is
// driving it, who is involved, what needs investigation.
// Spacious enterprise rhythm: generous gaps, quiet cards, scrolling
// is intentional — nothing is squeezed to fit one viewport.

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
import { formatCompactINR } from "../utils/format";
import KpiCards from "../components/dashboard/KpiCards";
import SectionCard from "../components/dashboard/SectionCard";
import HighImpactTable from "../components/dashboard/HighImpactTable";
import SpendLeakageChart from "../components/charts/SpendLeakageChart";
import SeverityDonut from "../components/charts/SeverityDonut";
import LeakageByBar from "../components/charts/LeakageByBar";
import PriceVarianceChart from "../components/charts/PriceVarianceChart";
import { ErrorPanel, LoadingPanel } from "../components/ui/States";
import Badge from "../components/ui/Badge";
import EmptyWorkspace from "../components/EmptyWorkspace";
import { IS_MOCK, hasMockData } from "../services/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const dashboard = useFetch(getDashboard, []);
  const leakage = useFetch(getLeakage, []);
  const trend = useFetch(getSpendLeakageTrend, []);
  const consolidation = useFetch(getConsolidationOpportunities, []);
  const contractExc = useFetch(getContractExceptions, []);

  const loading = dashboard.loading || leakage.loading || trend.loading;
  const error = dashboard.error || leakage.error || trend.error;
  const refetch = () => {
    dashboard.refetch();
    leakage.refetch();
    trend.refetch();
  };

  const charts = useMemo(() => {
    const items = leakage.data || [];
    return {
      byCategory: topGroups(groupLeakageBy(items, "category"), 6),
      severity: getSeverityDistribution(items),
      variance: getSupplierPriceVariance(items, 6),
    };
  }, [leakage.data]);

  if (loading) return <LoadingPanel label="Crunching procurement data…" />;
  if (error) return <ErrorPanel message={error.message} onRetry={refetch} />;

  const d = dashboard.data;

  // No content until a CSV has been imported (mock flag or empty DB).
  const workspaceEmpty = IS_MOCK ? !hasMockData() : (d?.transactionsAnalyzed ?? 0) === 0;
  if (workspaceEmpty) return <EmptyWorkspace />;

  return (
    <div className="flex flex-col gap-8">
      {/* Row 1 — page title + period control */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-heading font-semibold text-text-primary">
            Procurement Overview
          </h2>
          <p className="mt-1.5 text-body text-text-secondary">
            Spend, leakage and investigation status across analyzed records
          </p>
        </div>
        <span className="tnum rounded-control border border-border bg-surface px-3.5 py-2 text-caption text-text-secondary">
          Feb – Sep 2026 · demo data
        </span>
      </div>

      {/* Row 2 — four primary KPIs */}
      <KpiCards dashboard={d} />

      {/* Row 3 — primary chart + severity */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard
          title="Spend vs Potential Leakage"
          subtitle="Monthly procurement spend and flagged leakage"
          className="xl:col-span-2"
        >
          <SpendLeakageChart data={trend.data || []} height={300} />
        </SectionCard>

        <SectionCard title="Leakage Severity" subtitle="Flagged amount by severity">
          <SeverityDonut data={charts.severity} height={220} />
        </SectionCard>
      </div>

      {/* Row 4 — drivers */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard title="Leakage by Category" subtitle="Where spend leaks most">
          <LeakageByBar data={charts.byCategory} height={260} />
        </SectionCard>

        <SectionCard
          title="Supplier Price Variance"
          subtitle="Average premium vs median product price"
        >
          <PriceVarianceChart data={charts.variance} height={260} />
        </SectionCard>
      </div>

      {/* Row 5 — detailed evidence */}
      <SectionCard
        title="High-Impact Transactions"
        subtitle="Largest potential leakage — select a row to investigate"
      >
        <HighImpactTable
          items={leakage.data || []}
          limit={6}
          onInvestigate={(t) =>
            navigate("/investigation", { state: { transactionId: t.transactionId } })
          }
        />
      </SectionCard>

      {/* Below the fold — additional context */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard
          title="Supplier Consolidation Opportunities"
          subtitle="Products sourced from many suppliers — illustrative 6% saving"
        >
          <MiniTable
            head={["Product", "Suppliers", "Spend", "Potential Saving"]}
            rows={(consolidation.data || []).map((c) => [
              <span key="p" className="text-text-primary">{c.product}</span>,
              <span key="s" className="tnum">{c.supplierCount}</span>,
              <span key="sp" className="tnum">{formatCompactINR(c.spend)}</span>,
              <span key="sv" className="tnum text-success">
                {formatCompactINR(c.potentialSaving)}
              </span>,
            ])}
            empty="No consolidation opportunities in this dataset."
          />
        </SectionCard>

        <SectionCard
          title="Contract & Discount Exceptions"
          subtitle="Purchases outside expected terms"
        >
          <MiniTable
            head={["Transaction", "Supplier", "Exception", "Potential Impact"]}
            rows={(contractExc.data || []).map((e) => [
              <span key="t" className="tnum text-text-primary">{e.transactionId}</span>,
              <span key="s">{e.supplier}</span>,
              <Badge key="ty" variant={e.type === "Out-of-Contract" ? "MEDIUM" : "accent"}>
                {e.type}
              </Badge>,
              <span key="i" className="tnum text-danger">
                {formatCompactINR(e.potentialImpact)}
              </span>,
            ])}
            empty="No contract exceptions detected."
          />
        </SectionCard>
      </div>

      <p className="text-caption text-text-muted">
        Illustrative demo data — not real company figures.
      </p>
    </div>
  );
}

/** Quiet dense-but-breathable table for the lower panels. */
function MiniTable({ head, rows, empty }) {
  if (!rows.length) {
    return <p className="py-10 text-center text-small text-text-muted">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-small">
        <thead>
          <tr className="border-b border-border text-caption text-text-muted">
            {head.map((h, i) => (
              <th
                key={h}
                className={`pb-3 font-medium ${i > 0 ? "text-right" : ""}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr
              key={i}
              className="border-b border-border/50 transition-colors last:border-0 hover:bg-surface-hover/50"
            >
              {cells.map((c, j) => (
                <td key={j} className={`py-3.5 ${j > 0 ? "text-right" : ""} text-text-secondary`}>
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
