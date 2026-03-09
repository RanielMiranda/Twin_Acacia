import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(nodeScrypt);
const HASH_PREFIX = "scrypt";
const KEY_LENGTH = 64;

function toBuffer(value) {
  return Buffer.from(String(value || ""), "utf8");
}

export function isPasswordHash(value) {
  return String(value || "").startsWith(`${HASH_PREFIX}$`);
}

export async function hashPassword(password) {
  const normalized = String(password || "");
  if (!normalized) {
    throw new Error("Password is required.");
  }

  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(normalized, salt, KEY_LENGTH);
  return `${HASH_PREFIX}$${salt}$${Buffer.from(derived).toString("hex")}`;
}

export async function verifyPassword(password, storedValue) {
  const normalized = String(password || "");
  const stored = String(storedValue || "");

  if (!normalized || !stored) return false;
  if (!isPasswordHash(stored)) {
    return normalized === stored;
  }

  const [, salt, hashHex] = stored.split("$");
  if (!salt || !hashHex) return false;

  const derived = await scrypt(normalized, salt, KEY_LENGTH);
  const storedBuffer = Buffer.from(hashHex, "hex");
  const derivedBuffer = Buffer.from(derived);

  if (storedBuffer.length !== derivedBuffer.length) return false;
  return timingSafeEqual(storedBuffer, derivedBuffer);
}

export async function ensureStoredPasswordHash(password) {
  if (isPasswordHash(password)) return password;
  return hashPassword(password);
}

export function shouldUpgradePasswordHash(storedValue) {
  return !!storedValue && !isPasswordHash(storedValue);
}
