import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboard, getLeakage } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import {
  groupLeakageBy,
  getLeakageTrend,
  getSeverityDistribution,
  topGroups,
} from "../utils/aggregate";
import KpiCards from "../components/dashboard/KpiCards";
import SectionCard, { HeaderTotals } from "../components/dashboard/SectionCard";
import HighImpactTable from "../components/dashboard/HighImpactTable";
import LeakageByBar from "../components/charts/LeakageByBar";
import SeverityDonut from "../components/charts/SeverityDonut";
import LeakageTrend from "../components/charts/LeakageTrend";
import { ErrorPanel, LoadingPanel } from "../components/ui/States";

export default function Dashboard() {
  const navigate = useNavigate();

  // Two parallel fetches, one shared loading state — mirrors how the real
  // API endpoints will be consumed later.
  const dashboard = useFetch(getDashboard, []);
  const leakage = useFetch(getLeakage, []);

  const loading = dashboard.loading || leakage.loading;
  const error = dashboard.error || leakage.error;
  const refetch = () => {
    dashboard.refetch();
    leakage.refetch();
  };

  // Chart data derived from the leakage list — recomputed only when it changes.
  const charts = useMemo(() => {
    const items = leakage.data || [];
    return {
      bySupplier: topGroups(groupLeakageBy(items, "supplier"), 10),
      byCategory: topGroups(groupLeakageBy(items, "category"), 6),
      severity: getSeverityDistribution(items),
      trend: getLeakageTrend(items),
    };
  }, [leakage.data]);

  if (loading) return <LoadingPanel label="Crunching procurement data…" />;
  if (error)
    return (
      <ErrorPanel
        message={error.message}
        onRetry={refetch}
      />
    );

  const d = dashboard.data;
  const items = leakage.data || [];

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      {/* Page heading */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Leakage Overview</h1>
          <p className="mt-0.5 text-sm text-ink-400">
            Procurement spend analyzed for potential leakage · FY 2026
          </p>
        </div>
        <p className="text-xs text-ink-400">
          Detection engine v1 · 5 detection types · Feb–Sep 2026
        </p>
      </div>

      {/* KPI row */}
      <KpiCards dashboard={d} />

      {/* Charts row 1: supplier + severity */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <SectionCard
          title="Leakage by Supplier"
          subtitle="Top suppliers by potential leakage"
          className="xl:col-span-2"
          delay={0.05}
          action={<HeaderTotals value={d.potentialLeakage} count={d.flaggedTransactions} />}
        >
          <LeakageByBar data={charts.bySupplier} />
        </SectionCard>

        <SectionCard
          title="Severity Distribution"
          subtitle="Flagged amount by severity"
          delay={0.1}
        >
          <SeverityDonut data={charts.severity} />
        </SectionCard>
      </div>

      {/* Charts row 2: trend + category */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <SectionCard
          title="Leakage Trend"
          subtitle="Monthly potential leakage"
          className="xl:col-span-2"
          delay={0.15}
        >
          <LeakageTrend data={charts.trend} />
        </SectionCard>

        <SectionCard
          title="Leakage by Category"
          subtitle="Which spend categories leak most"
          delay={0.2}
        >
          <LeakageByBar data={charts.byCategory} height={260} />
        </SectionCard>
      </div>

      {/* High-impact transactions */}
      <SectionCard
        title="High-Impact Transactions"
        subtitle="Largest potential leakage — click a row to investigate"
        delay={0.25}
      >
        <HighImpactTable
          items={items}
          limit={8}
          onInvestigate={(t) =>
            navigate("/investigation", { state: { transactionId: t.transactionId } })
          }
        />
      </SectionCard>
    </div>
  );
}
