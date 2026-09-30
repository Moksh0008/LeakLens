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
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-danger/20 bg-danger/5 px-6 py-14 text-center">
      <AlertIcon size={28} className="text-danger" />
      <div>
        <p className="font-semibold text-text-primary">Something went wrong</p>
        <p className="mt-1 text-small text-text-secondary">{message || "Could not load data."}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 rounded-control bg-danger px-3.5 py-2 text-small font-medium text-white transition hover:bg-danger/80"
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
    <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border bg-surface px-6 py-14 text-center">
      <InboxIcon size={26} className="text-text-muted" />
      <p className="font-medium text-text-secondary">{message}</p>
      {hint && <p className="text-small text-text-muted">{hint}</p>}
    </div>
  );
}
