import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import { LoadingPanel } from "./components/ui/States";
import { useFetch } from "./hooks/useFetch";
import { getDashboard } from "./services/api";

// Route-level code splitting: the landing page (first paint) only downloads
// its own chunk — heavy pages (recharts-backed Dashboard/Analytics, etc.)
// load on demand.
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const StyleGuide = lazy(() => import("./pages/StyleGuide"));
const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Transactions = lazy(() => import("./pages/Transactions"));
const ModulePlaceholder = lazy(() => import("./pages/ModulePlaceholder"));
const LeakageAnalysis = lazy(() => import("./pages/LeakageAnalysis"));
const Upload = lazy(() => import("./pages/Upload"));
const Investigation = lazy(() => import("./pages/Investigation"));
const Analytics = lazy(() => import("./pages/Analytics"));

/**
 * LayoutRoute — wraps pages in the sidebar/topbar shell.
 * The sidebar's "flagged transactions" counter reuses the same
 * getDashboard call so it always matches the Dashboard KPI card.
 */
function LayoutRoute() {
  const { data } = useFetch(getDashboard, []);
  return (
    <AppLayout flaggedCount={data?.flaggedTransactions}>
      {/* Inner boundary: a lazy route chunk loads *inside* the shell, so the
          sidebar and header stay mounted instead of the whole app blanking
          to a full-screen spinner on every first visit to a page. */}
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingPanel label="Loading…" />
          </div>
        }
      >
        <Outlet />
      </Suspense>
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
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-background">
            <LoadingPanel label="Loading…" />
          </div>
        }
      >
        <Routes>
          {/* Public site */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Design-system reference */}
          <Route path="/styleguide" element={<StyleGuide />} />

          {/* Authenticated app shell */}
          <Route element={<LayoutRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/price-benchmarking" element={<ModulePlaceholder moduleKey="price-benchmarking" />} />
            <Route path="/supplier-analysis" element={<ModulePlaceholder moduleKey="supplier-analysis" />} />
            <Route path="/contracts" element={<ModulePlaceholder moduleKey="contracts" />} />
            <Route path="/leakage" element={<LeakageAnalysis />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/investigation" element={<Investigation />} />
            <Route path="/analytics" element={<Analytics />} />

            {/* Convenient aliases used across the product */}
            <Route path="/import" element={<Upload />} />
            <Route path="/benchmarking" element={<ModulePlaceholder moduleKey="price-benchmarking" />} />
            <Route path="/suppliers" element={<ModulePlaceholder moduleKey="supplier-analysis" />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
