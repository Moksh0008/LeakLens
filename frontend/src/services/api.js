// api.js — the ONLY place the app talks to "the backend".
//
// TWO MODES, one stable interface (pages never change):
//   MOCK MODE (default) — data comes from ./mockData with a small delay.
//   REAL API MODE       — set VITE_USE_MOCK=false in frontend/.env and the
//                         same functions call Member 3's Express backend.
//
// Backend contract (see backend/src/routes/*, all under VITE_API_URL):
//   GET  /api/dashboard            → { totalProcurement, potentialLeakage,
//                                      transactionsAnalyzed, flaggedTransactions }
//   GET  /api/transactions         → [{ transactionId, date, product, category,
//                                      supplier, quantity, unitPrice, totalAmount }]
//   GET  /api/leakage              → [{ transactionId, product, supplier, quantity,
//                                      actualPrice, benchmarkPrice, potentialLeakage,
//                                      severity, detectionType, reason }]
//   GET  /api/leakage/:txId        → single leakage record (404 if none)
//   POST /api/upload (field "file")→ { success, transactionsInserted, flaggedTransactions }
//
// NOTE — analytics endpoints are NOT defined on the backend yet, so in real
// mode the three analytics series are DERIVED client-side from the real
// leakage/transaction data (same builders the mock uses). When Member 3 adds
// /api/analytics/*, swap the bodies below — no page changes.

import {
  buildConsolidationOpportunities,
  buildContractExceptions,
  buildMockDashboard,
  buildSpendLeakageTrend,
  mockLeakage,
  mockTransactions,
} from "./mockData";

// Mock by default so the app always runs; flip via env for the real backend.
export const IS_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
const USE_MOCK = IS_MOCK;
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const MOCK_DELAY_MS = 600;

/** True once a CSV upload has populated the (mock) workspace. */
export function hasMockData() {
  return localStorage.getItem("leaklens.hasData") === "1";
}

function mockResponse(data) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(data), MOCK_DELAY_MS),
  );
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    // Surface the backend's { message } when it provides one.
    let message = `API ${res.status}: ${path}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* non-JSON error body — keep the default message */
    }
    throw new Error(message);
  }
  return res.json();
}

/** GET /api/dashboard */
export function getDashboard() {
  if (USE_MOCK) return mockResponse(buildMockDashboard());
  // Backend shape covers the required fields; optional KPI fields
  // (missedSavings, openInvestigations) are undefined-safe in the UI.
  return apiGet("/dashboard");
}

/**
 * GET /api/transactions — all transactions (clean + flagged).
 *
 * Real-mode adapter: the backend serves transactions and leakage from two
 * tables, but the UI models the JOINED view (leakage fields on each row).
 * We merge them here by transactionId so pages never know the difference.
 * Rows without a leakage record are clean (potentialLeakage 0 / NONE).
 */
export async function getTransactions() {
  if (USE_MOCK) return mockResponse(mockTransactions);

  const [transactions, leakage] = await Promise.all([
    apiGet("/transactions"),
    apiGet("/leakage"),
  ]);
  const leakageById = new Map(leakage.map((l) => [l.transactionId, l]));

  return transactions.map((t) => {
    const l = leakageById.get(t.transactionId);
    return l
      ? {
          ...t,
          actualPrice: l.actualPrice,
          benchmarkPrice: l.benchmarkPrice,
          potentialLeakage: l.potentialLeakage,
          severity: l.severity ?? "LOW",
          detectionType: l.detectionType ?? "NONE",
          reason: l.reason,
        }
      : { ...t, potentialLeakage: 0, severity: "LOW", detectionType: "NONE" };
  });
}

/** GET /api/leakage — only flagged transactions */
export function getLeakage() {
  if (USE_MOCK) return mockResponse(mockLeakage);
  return apiGet("/leakage");
}

/** Dashboard analytical series. Mock-derived; real mode derives from live data. */
export async function getSpendLeakageTrend() {
  if (USE_MOCK) return mockResponse(buildSpendLeakageTrend());
  const joined = await getTransactions();
  return buildSpendLeakageTrend(joined);
}

export async function getConsolidationOpportunities() {
  if (USE_MOCK) return mockResponse(buildConsolidationOpportunities());
  const joined = await getTransactions();
  return buildConsolidationOpportunities(joined);
}

export async function getContractExceptions() {
  if (USE_MOCK) return mockResponse(buildContractExceptions());
  const leakage = await apiGet("/leakage");
  return buildContractExceptions(leakage);
}

/** GET /api/leakage/:transactionId — one leakage record with evidence */
export function getLeakageById(transactionId) {
  if (USE_MOCK) {
    const found = mockLeakage.find((l) => l.transactionId === transactionId);
    if (!found) {
      return new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`No leakage record for ${transactionId}`)),
          MOCK_DELAY_MS,
        ),
      );
    }
    return mockResponse(found);
  }
  return apiGet(`/leakage/${transactionId}`);
}

/**
 * POST /api/upload — send a procurement CSV for processing.
 * Restored interface from Member 2's upload workflow; the backend parses,
 * validates, runs detection and stores results, returning a summary.
 * Both modes resolve to the same shape:
 *   { success, transactionsInserted, flaggedTransactions, message }
 */
export async function uploadProcurementFile(file) {
  if (!file) throw new Error("No file selected.");
  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("Please upload a CSV file.");
  }

  if (USE_MOCK) {
    await mockResponse(null); // simulate processing delay
    // Mark the mock workspace as populated so Home/Dashboard stop
    // showing the empty state and start showing the sample dataset.
    localStorage.setItem("leaklens.hasData", "1");
    return {
      success: true,
      transactionsInserted: mockTransactions.length,
      flaggedTransactions: mockLeakage.length,
      message:
        "Demo mode: sample dataset loaded — open Home or Dashboard to explore it.",
    };
  }

  const body = new FormData();
  body.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Upload failed (${res.status}).`);
  }
  return {
    success: true,
    transactionsInserted: data.transactionsInserted ?? 0,
    flaggedTransactions: data.flaggedTransactions ?? 0,
    message: data.message,
  };
}
