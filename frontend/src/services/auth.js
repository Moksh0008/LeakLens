// auth.js — authentication service.
//
// TWO MODES, matching services/api.js:
//   MOCK MODE (default) — any credentials "work" after a short delay,
//                         so the deployed demo never needs a backend.
//   REAL API MODE       — VITE_USE_MOCK=false → POSTs to the Express
//                         backend (/api/auth/login, /api/auth/signup),
//                         which verifies credentials via Supabase Auth.
//
// On a successful real login the session tokens are stored in
// localStorage under "leaklens.session" for later route guards.

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
// VITE_API_URL points at ".../api" — strip the suffix for auth paths.
const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");
const NETWORK_DELAY = 900;
const SESSION_KEY = "leaklens.session";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function authCall(path, payload) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/auth${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  let body = {};
  try {
    body = await res.json();
  } catch {
    /* non-JSON response — fall through to the status check */
  }

  if (!res.ok) {
    throw new Error(body.message || `Authentication failed (${res.status}).`);
  }
  return body;
}

/** Sign in with an existing account. */
export async function signIn({ email, password }) {
  if (USE_MOCK) {
    await delay(NETWORK_DELAY);
    return { user: { email } };
  }

  const body = await authCall("/login", { email, password });
  if (body.session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(body.session));
  }
  if (body.user) {
    localStorage.setItem("leaklens.user", JSON.stringify(body.user));
  }
  return body;
}

/** Create a new account. */
export async function signUp(payload) {
  if (USE_MOCK) {
    await delay(NETWORK_DELAY);
    return { user: { email: payload.email } };
  }

  const body = await authCall("/signup", payload);
  return body;
}

/** Stored session (null in mock mode or when logged out). */
export function getStoredSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

/** Clear the stored session and profile (logout). */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("leaklens.user");
}
