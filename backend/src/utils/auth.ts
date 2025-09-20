import crypto from "node:crypto";

//make random value for state and PKCE secret and encode into base64 URL
export function randomUrlSafe(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

//change input to SHA-256 hash and encode into base64 URL
export function sha256base64url(input: string): string {
  const h = crypto.createHash("sha256").update(input).digest();
  return h.toString("base64url");
}

export function buildPkce() {
  const state = randomUrlSafe(16);
  const code_verifier = randomUrlSafe(48);
  const code_challenge = sha256base64url(code_verifier);
  return { state, code_verifier, code_challenge };
}
export function sanitizeRedirect(to?: string): string {
  if (!to) return "/";
  return /^\/[^\s]*$/.test(to) ? to : "/";
}
