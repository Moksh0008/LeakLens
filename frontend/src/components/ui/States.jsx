import { AlertIcon, InboxIcon, RefreshIcon } from "./Icons";

/** Full-panel loading skeleton (used inside pages while data arrives). */
export function LoadingPanel({ label = "Loading data…" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-3 py-16 text-ink-400"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

/** Error state with a retry button (uses refetch from useFetch). */
export function ErrorPanel({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50/60 px-6 py-14 text-center">
      <AlertIcon size={28} className="text-red-500" />
      <div>
        <p className="font-semibold text-red-800">Something went wrong</p>
        <p className="mt-1 text-sm text-red-600">{message || "Could not load data."}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          <RefreshIcon size={15} />
          Retry
        </button>
      )}
    </div>
  );
}

/** Empty state for lists/tables with no rows after filtering. */
export function EmptyPanel({ message = "Nothing to show", hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
      <InboxIcon size={26} className="text-ink-300" />
      <p className="font-medium text-ink-600">{message}</p>
      {hint && <p className="text-sm text-ink-400">{hint}</p>}
    </div>
  );
}
