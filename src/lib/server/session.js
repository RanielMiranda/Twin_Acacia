import { NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "app_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
  const configured = process.env.APP_SESSION_SECRET || process.env.CRON_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV !== "production") return "dev-session-secret-change-me";
  throw new Error("Missing APP_SESSION_SECRET");
}

function encodeBase64Url(value) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64url");
  }
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "base64url").toString("utf8");
  }
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(`${normalized}${padding}`);
}

async function importHmacKey() {
  const secret = getSessionSecret();
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function signValue(value) {
  const key = await importHmacKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  const bytes = Array.from(new Uint8Array(signature))
    .map((entry) => String.fromCharCode(entry))
    .join("");
  return encodeBase64Url(bytes);
}

async function verifyValueSignature(value, signature) {
  const expected = await signValue(value);
  return expected === signature;
}

export function buildSessionPayload(account) {
  return {
    accountId: Number(account?.id || 0),
    role: String(account?.role || "owner").toLowerCase(),
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
}

export async function createSessionToken(payload) {
  const body = encodeBase64Url(JSON.stringify(payload));
  const signature = await signValue(body);
  return `${body}.${signature}`;
}

export async function parseSessionToken(token) {
  if (!token || !String(token).includes(".")) return null;
  const [body, signature] = String(token).split(".");
  if (!body || !signature) return null;

  const valid = await verifyValueSignature(body, signature);
  if (!valid) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(body));
    if (!payload?.accountId || !payload?.role || !payload?.exp) return null;
    if (Number(payload.exp) <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(request) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value || "";
  return parseSessionToken(token);
}

export async function attachSessionCookie(response, account) {
  const token = await createSessionToken(buildSessionPayload(account));
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}

export function clearSessionCookie(response = NextResponse.json({ ok: true })) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
