import { createServiceSupabaseClient } from "@/lib/server/serviceSupabase";
import { hashPassword, shouldUpgradePasswordHash } from "@/lib/server/passwords";

export const ACCOUNT_PUBLIC_COLUMNS = [
  "id",
  "full_name",
  "email",
  "phone",
  "profile_image",
  "role",
  "status",
  "resort_id",
  "setup_complete",
  "setup_token",
  "created_at",
  "updated_at",
  "resorts(id, name, location)",
].join(", ");

export const ACCOUNT_INTERNAL_COLUMNS = [
  ACCOUNT_PUBLIC_COLUMNS,
  "password",
].join(", ");

export function sanitizeAccount(account) {
  if (!account) return null;
  const { password, ...rest } = account;
  return rest;
}

function normalizeSupabaseError(error) {
  const message = String(error?.message || "");
  if (
    error?.code === "PGRST205" ||
    message.includes("account_recovery_requests") ||
    message.includes("schema cache")
  ) {
    return new Error("Database schema is missing account recovery support. Run supabase/schema.sql.");
  }
  return error;
}

export async function listAccounts() {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("accounts")
    .select(ACCOUNT_PUBLIC_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAccountById(accountId, { includePassword = false } = {}) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("accounts")
    .select(includePassword ? ACCOUNT_INTERNAL_COLUMNS : ACCOUNT_PUBLIC_COLUMNS)
    .eq("id", Number(accountId))
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function getAccountByEmail(email, { includePassword = false } = {}) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("accounts")
    .select(includePassword ? ACCOUNT_INTERNAL_COLUMNS : ACCOUNT_PUBLIC_COLUMNS)
    .eq("email", String(email || "").trim().toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function getAccountBySetupToken(token, { includePassword = false } = {}) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("accounts")
    .select(includePassword ? ACCOUNT_INTERNAL_COLUMNS : ACCOUNT_PUBLIC_COLUMNS)
    .eq("setup_token", String(token || ""))
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function createAccountInvite(payload) {
  const supabase = createServiceSupabaseClient();
  const row = {
    full_name: payload.fullName || "",
    email: String(payload.email || "").trim().toLowerCase(),
    phone: payload.phone || "",
    password: await hashPassword(payload.password || ""),
    role: payload.role === "admin" ? "admin" : "owner",
    status: payload.status || "pending",
    resort_id: payload.resortId ? Number(payload.resortId) : null,
    setup_complete: false,
    setup_token: payload.setupToken,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("accounts")
    .insert(row)
    .select(ACCOUNT_PUBLIC_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

export async function updateAccount(accountId, updates) {
  const supabase = createServiceSupabaseClient();
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };
  if (typeof payload.email === "string") {
    payload.email = payload.email.trim().toLowerCase();
  }
  if (typeof payload.password === "string" && payload.password) {
    payload.password = await hashPassword(payload.password);
  } else {
    delete payload.password;
  }

  const { data, error } = await supabase
    .from("accounts")
    .update(payload)
    .eq("id", Number(accountId))
    .select(ACCOUNT_PUBLIC_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

export async function upgradeLegacyPassword(accountId, password) {
  if (!password || !shouldUpgradePasswordHash(password)) return;
  const supabase = createServiceSupabaseClient();
  await supabase
    .from("accounts")
    .update({
      password: await hashPassword(password),
      updated_at: new Date().toISOString(),
    })
    .eq("id", Number(accountId));
}

export async function completeAccountSetup(token, updates) {
  const account = await getAccountBySetupToken(token, { includePassword: true });
  if (!account) {
    throw new Error("Setup token is invalid.");
  }

  const supabase = createServiceSupabaseClient();
  const payload = {
    profile_image: updates.profile_image || account.profile_image || null,
    setup_complete: true,
    status: "active",
    setup_token: null,
    updated_at: new Date().toISOString(),
  };

  if (updates.password) {
    payload.password = await hashPassword(updates.password);
  }

  const { data, error } = await supabase
    .from("accounts")
    .update(payload)
    .eq("id", account.id)
    .select(ACCOUNT_PUBLIC_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAccount(accountId) {
  const supabase = createServiceSupabaseClient();
  const { error } = await supabase.from("accounts").delete().eq("id", Number(accountId));
  if (error) throw error;
}

export async function createRecoveryRequest({ email, message }) {
  const supabase = createServiceSupabaseClient();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const account = normalizedEmail ? await getAccountByEmail(normalizedEmail) : null;
  const { data, error } = await supabase
    .from("account_recovery_requests")
    .insert({
      account_id: account?.id || null,
      email: normalizedEmail || null,
      message: message || "",
      status: "open",
    })
    .select("id, account_id, email, message, status, created_at, resolved_at")
    .single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}

export async function listRecoveryRequests() {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("account_recovery_requests")
    .select("id, account_id, email, message, status, created_at, resolved_at")
    .order("created_at", { ascending: false });
  if (error) throw normalizeSupabaseError(error);
  return data || [];
}

export async function resolveRecoveryRequest(requestId) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("account_recovery_requests")
    .update({
      status: "resolved",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", Number(requestId))
    .select("id, account_id, email, message, status, created_at, resolved_at")
    .single();
  if (error) throw normalizeSupabaseError(error);
  return data;
}
