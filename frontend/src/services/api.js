// api.js — the ONLY place the app talks to "the backend".
//
// Today it returns MOCK data (with a tiny artificial delay so loading
// states are visible). When Member 2's Express API is ready:
//   1. set USE_MOCK = false
//   2. fill in the fetch() calls below
// Every page keeps working with zero UI changes.
//
// Agreed endpoints:
//   GET /api/dashboard
//   GET /api/transactions
//   GET /api/leakage
//   GET /api/leakage/:transactionId

import {
  buildConsolidationOpportunities,
  buildContractExceptions,
  buildMockDashboard,
  buildSpendLeakageTrend,
  mockLeakage,
  mockTransactions,
} from "./mockData";

const USE_MOCK = true;
const API_BASE = "/api"; // behind a Vite proxy in production/dev
const MOCK_DELAY_MS = 600;

function mockResponse(data) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(data), MOCK_DELAY_MS),
  );
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

/** GET /api/dashboard */
export function getDashboard() {
  if (USE_MOCK) return mockResponse(buildMockDashboard());
  return apiGet("/dashboard");
}

/** GET /api/transactions — all transactions (clean + flagged) */
export function getTransactions() {
  if (USE_MOCK) return mockResponse(mockTransactions);
  return apiGet("/transactions");
}

/** GET /api/leakage — only flagged transactions */
export function getLeakage() {
  if (USE_MOCK) return mockResponse(mockLeakage);
  return apiGet("/leakage");
}

/** Dashboard analytical series (mock-derived; backend will own these). */
export function getSpendLeakageTrend() {
  if (USE_MOCK) return mockResponse(buildSpendLeakageTrend());
  return apiGet("/analytics/spend-leakage-trend");
}

export function getConsolidationOpportunities() {
  if (USE_MOCK) return mockResponse(buildConsolidationOpportunities());
  return apiGet("/analytics/consolidation");
}

export function getContractExceptions() {
  if (USE_MOCK) return mockResponse(buildContractExceptions());
  return apiGet("/analytics/contract-exceptions");
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
