import { useState } from "react";
import { UploadIcon, DocIcon } from "../components/ui/Icons";

/**
 * Upload page — frontend-only placeholder for Member 2's CSV upload endpoint.
 * The UI is functional (drop zone + file list) but does not POST anywhere yet.
 */
export default function Upload() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Upload Data</h1>
        <p className="mt-0.5 text-sm text-ink-400">
          Load a procurement CSV to run leakage detection
        </p>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed bg-surface px-6 py-16 text-center transition ${
          dragging ? "border-accent bg-accent-soft" : "border-border-strong"
        }`}
      >
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0])}
        />
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-50 text-ink-400">
          <UploadIcon size={22} />
        </span>
        <div>
          <p className="font-medium text-ink-700">
            {file ? file.name : "Drop your procurement CSV here"}
          </p>
          <p className="mt-1 text-xs text-ink-400">
            {file
              ? `${(file.size / 1024).toFixed(1)} KB selected`
              : "or click to browse — detection runs on the backend"}
          </p>
        </div>
      </label>

      <div className="rounded-card border border-border bg-surface p-5">
        <div className="flex items-center gap-2.5">
          <DocIcon size={18} className="text-ink-400" />
          <h2 className="text-sm font-semibold text-ink-800">Expected CSV columns</h2>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            "transactionId",
            "date",
            "supplier",
            "category",
            "product",
            "quantity",
            "unitPrice",
            "benchmarkPrice",
          ].map((col) => (
            <code key={col} className="tnum rounded-md bg-ink-50 px-2 py-1 text-xs text-ink-600">
              {col}
            </code>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-400">
          Backend (Member 2) will parse this CSV, run the Python detection engine and return
          flagged leakage records — this screen will POST to <code>POST /api/upload</code> then.
        </p>
      </div>
    </div>
  );
}
