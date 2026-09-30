import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Upload from "./pages/Upload";
import Investigation from "./pages/Investigation";
import Analytics from "./pages/Analytics";
import StyleGuide from "./pages/StyleGuide";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ModulePlaceholder from "./pages/ModulePlaceholder";
import { useFetch } from "./hooks/useFetch";
import { getDashboard } from "./services/api";

/**
 * LayoutRoute — wraps pages in the sidebar/topbar shell.
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
 * App — router + shared application shell.
 * Pages fetch through src/services/api.js, so switching
 * mock → real API never touches any UI code.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Design-system reference */}
        <Route path="/styleguide" element={<StyleGuide />} />

        {/* Authenticated app shell */}
        <Route element={<LayoutRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/price-benchmarking" element={<ModulePlaceholder moduleKey="price-benchmarking" />} />
          <Route path="/supplier-analysis" element={<ModulePlaceholder moduleKey="supplier-analysis" />} />
          <Route path="/contracts" element={<ModulePlaceholder moduleKey="contracts" />} />
          <Route path="/leakage" element={<ModulePlaceholder moduleKey="leakage" />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/investigation" element={<Investigation />} />
          <Route path="/analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
