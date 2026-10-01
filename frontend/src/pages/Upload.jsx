import { useState } from "react";
import { UploadIcon, DocIcon, CloseIcon } from "../components/ui/Icons";
import Button from "../components/ui/Button";
import { uploadProcurementFile } from "../services/api";

/**
 * Upload page — focused, centered CSV import.
 * The dropzone is deliberately compact (max-w-xl, centered) — a calm,
 * single-task screen rather than a stretched full-width strip.
 *
 * "Run detection" calls uploadProcurementFile() (services/api.js):
 * mock mode returns an illustrative summary; real mode POSTs the CSV to
 * POST /api/upload where it is parsed, validated and run through the
 * detection engine.
 */

const CSV_COLUMNS = [
  "transactionId",
  "date",
  "supplier",
  "category",
  "product",
  "quantity",
  "unitPrice",
  "totalAmount",
];

export default function Upload() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState(null);
  const [uploading, setUploading] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    setNotice(null);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }

  function handlePick(e) {
    setNotice(null);
    setFile(e.target.files?.[0] || null);
  }

  async function runDetection() {
    if (!file || uploading) return;
    setUploading(true);
    setNotice(null);
    try {
      const result = await uploadProcurementFile(file);
      setNotice(
        `${result.message || "Upload complete."} — ${result.transactionsInserted} transactions processed, ${result.flaggedTransactions} flagged.`,
      );
    } catch (err) {
      setNotice(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function clearFile() {
    setFile(null);
    setNotice(null);
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center pt-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-heading font-semibold text-text-primary">Upload Data</h1>
        <p className="mt-1.5 text-body text-text-secondary">
          Load a procurement CSV to run leakage detection
        </p>
      </div>

      {/* Dropzone — compact and centered */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`mt-10 flex w-full cursor-pointer flex-col items-center justify-center gap-3.5 rounded-card border border-dashed bg-surface px-6 py-14 text-center transition-colors duration-150 ${
          dragging
            ? "border-accent bg-accent-soft"
            : "border-border-strong hover:border-border-strong hover:bg-surface-elevated/60"
        }`}
      >
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handlePick}
          aria-label="Choose a CSV file"
        />

        {!file ? (
          <>
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-elevated text-accent">
              <UploadIcon size={20} />
            </span>
            <div>
              <p className="text-body font-medium text-text-primary">
                Drop your procurement CSV here
              </p>
              <p className="mt-1 text-caption text-text-muted">
                or click to browse
              </p>
            </div>
          </>
        ) : (
          <>
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-elevated text-accent">
              <DocIcon size={20} />
            </span>
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-body font-medium text-text-primary">
                {file.name}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  clearFile();
                }}
                className="rounded-control p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
                aria-label="Remove selected file"
              >
                <CloseIcon size={14} />
              </button>
            </div>
            <p className="tnum text-caption text-text-muted">
              {(file.size / 1024).toFixed(1)} KB · CSV
            </p>
            <div className="mt-2 flex items-center gap-2.5">
              <Button
                variant="primary"
                size="sm"
                disabled={uploading}
                onClick={(e) => {
                  e.preventDefault();
                  runDetection();
                }}
              >
                {uploading ? "Processing…" : "Run detection"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  clearFile();
                }}
              >
                Choose another
              </Button>
            </div>
          </>
        )}
      </label>

      {/* Feedback line (run detection / errors) */}
      {notice && (
        <p className="mt-4 text-center text-caption text-text-muted" role="status">
          {notice}
        </p>
      )}

      {/* Schema hint — one quiet line, replaces the old columns card */}
      <p className="mt-8 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-caption text-text-muted">
        <DocIcon size={13} className="mr-1 shrink-0" />
        <span>Expected columns:</span>
        {CSV_COLUMNS.map((col, i) => (
          <span key={col}>
            <code className="tnum text-caption text-text-secondary">{col}</code>
            {i < CSV_COLUMNS.length - 1 && (
              <span className="ml-1.5 text-border-strong">·</span>
            )}
          </span>
        ))}
      </p>
    </div>
  );
}
