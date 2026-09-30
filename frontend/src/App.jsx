import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Upload from "./pages/Upload";
import Investigation from "./pages/Investigation";
import Analytics from "./pages/Analytics";
import StyleGuide from "./pages/StyleGuide";
import { useFetch } from "./hooks/useFetch";
import { getDashboard } from "./services/api";

/**
 * LayoutRoute — wraps pages in the sidebar/topbar layout.
 * The sidebar's "flagged transactions" counter reuses the same
 * getDashboard call so it always matches the Dashboard KPI card.
 */
function LayoutRoute() {
  const { data } = useFetch(getDashboard, []);
  return (
    <AppLayout flaggedCount={data?.flaggedTransactions}>
      <Outlet />
    </AppLayout>
  );
}

/**
 * App — router + shared layout.
 * Pages fetch through src/services/api.js, so switching
 * mock → real API never touches any UI code.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Design-system foundation (current milestone) */}
        <Route path="/" element={<Navigate to="/styleguide" replace />} />
        <Route path="/styleguide" element={<StyleGuide />} />

        {/* Existing app pages (kept intact — will be migrated to the new tokens next) */}
        <Route element={<LayoutRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/investigation" element={<Investigation />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
