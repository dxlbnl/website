import { ADMIN_TOKEN } from "$env/static/private";

async function hmac(nonce: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(ADMIN_TOKEN),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(nonce));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createAdminSession(): Promise<string> {
  const nonce = crypto.randomUUID();
  return `${nonce}.${await hmac(nonce)}`;
}

export async function verifyAdminSession(cookie: string | undefined): Promise<boolean> {
  if (!cookie) return false;
  const dot = cookie.indexOf(".");
  if (dot === -1) return false;
  const nonce = cookie.slice(0, dot);
  const provided = cookie.slice(dot + 1);
  const expected = await hmac(nonce);
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
