// auth.js — TEMPORARY frontend-only authentication stubs.
//
// The Login/Signup UIs depend ONLY on these two functions and their
// promise contract. When Member 3's real API is ready, replace the
// bodies with real calls — no UI changes needed:
//   signIn({ email, password })  → POST /api/auth/login
//   signUp(payload)              → POST /api/auth/signup
//
// Passwords are never logged.

const NETWORK_DELAY = 900;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Sign in with an existing account. TODO(backend): real API call. */
export async function signIn({ email /* password intentionally unused for now */ }) {
  await delay(NETWORK_DELAY);
  return { user: { email } };
}

/** Create a new account. TODO(backend): real API call. */
export async function signUp(payload) {
  await delay(NETWORK_DELAY);
  return { user: { email: payload.email } };
}
