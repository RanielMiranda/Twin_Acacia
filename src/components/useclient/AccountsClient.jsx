"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BUCKET_NAME, convertImageFileToWebp, getStoragePathFromPublicUrl } from "@/lib/utils";

const AccountsContext = createContext(null);

async function readJson(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error || "Request failed.");
  }
  return body;
}

export function AccountsProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeAccount, setActiveAccount] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const refreshSession = useCallback(async () => {
    setLoadingSession(true);
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        cache: "no-store",
      });
      const body = await readJson(response);
      setActiveAccount(body.account || null);
      return body.account || null;
    } finally {
      setLoadingSession(false);
    }
  }, []);

  useEffect(() => {
    refreshSession().catch(() => {
      setActiveAccount(null);
      setLoadingSession(false);
    });
  }, [refreshSession]);

  const refreshAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/accounts", {
        method: "GET",
        cache: "no-store",
      });
      const body = await readJson(response);
      setAccounts(body.accounts || []);
      return body.accounts || [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createAccountInvite = useCallback(async (payload) => {
    const response = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await readJson(response);
    setAccounts((prev) => [body.account, ...prev]);
    return { account: body.account, setupLink: body.setupLink };
  }, []);

  const updateAccount = useCallback(
    async (accountId, updates) => {
      const response = await fetch(`/api/accounts/${Number(accountId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const body = await readJson(response);
      const account = body.account || null;
      setAccounts((prev) => prev.map((entry) => (entry.id === account?.id ? account : entry)));
      if (activeAccount?.id === account?.id) {
        setActiveAccount(account);
      }
      return account;
    },
    [activeAccount?.id]
  );

  const saveAccountProfile = useCallback(
    async (accountId, updates = {}, profileFile = null, previousImageUrl = null) => {
      let nextProfileImage = updates?.profile_image || null;

      if (profileFile instanceof File) {
        const normalized = await convertImageFileToWebp(profileFile, 0.82);
        const path = `accounts/${Number(accountId)}/profile-${Date.now()}.webp`;
        const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(path, normalized, {
          upsert: true,
          contentType: "image/webp",
        });
        if (uploadError) throw uploadError;
        const { data: uploaded } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
        nextProfileImage = uploaded?.publicUrl || nextProfileImage;
      }

      const saved = await updateAccount(accountId, {
        ...updates,
        profile_image: nextProfileImage,
      });

      if (profileFile instanceof File && previousImageUrl && nextProfileImage && previousImageUrl !== nextProfileImage) {
        const previousPath = getStoragePathFromPublicUrl(previousImageUrl, BUCKET_NAME);
        if (previousPath) {
          await supabase.storage.from(BUCKET_NAME).remove([previousPath]);
        }
      }

      return saved;
    },
    [updateAccount]
  );

  const deleteAccount = useCallback(
    async (accountId) => {
      const response = await fetch(`/api/accounts/${Number(accountId)}`, {
        method: "DELETE",
      });
      await readJson(response);
      setAccounts((prev) => prev.filter((entry) => entry.id !== Number(accountId)));
      if (activeAccount?.id === Number(accountId)) {
        setActiveAccount(null);
      }
    },
    [activeAccount?.id]
  );

  const getAccountById = useCallback(async (accountId) => {
    const response = await fetch(`/api/accounts/${Number(accountId)}`, {
      method: "GET",
      cache: "no-store",
    });
    const body = await readJson(response);
    return body.account || null;
  }, []);

  const getAccountBySetupToken = useCallback(async (token) => {
    if (!token) return null;
    const response = await fetch(`/api/accounts/setup?token=${encodeURIComponent(token)}`, {
      method: "GET",
      cache: "no-store",
    });
    const body = await readJson(response);
    return body.account || null;
  }, []);

  const completeSetup = useCallback(async (token, updates) => {
    const response = await fetch("/api/accounts/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        password: updates?.password || "",
        profile_image: updates?.profile_image || null,
      }),
    });
    const body = await readJson(response);
    setAccounts((prev) => prev.map((entry) => (entry.id === body.account?.id ? body.account : entry)));
    return body.account || null;
  }, []);

  const signIn = useCallback(async (email, password) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await readJson(response);
    setActiveAccount(body.account || null);
    return body.account || null;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setActiveAccount(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      accounts,
      loading,
      activeAccount,
      loadingSession,
      refreshSession,
      refreshAccounts,
      createAccountInvite,
      updateAccount,
      saveAccountProfile,
      deleteAccount,
      getAccountById,
      getAccountBySetupToken,
      completeSetup,
      signIn,
      signOut,
    }),
    [
      accounts,
      loading,
      activeAccount,
      loadingSession,
      refreshSession,
      refreshAccounts,
      createAccountInvite,
      updateAccount,
      saveAccountProfile,
      deleteAccount,
      getAccountById,
      getAccountBySetupToken,
      completeSetup,
      signIn,
      signOut,
    ]
  );

  return <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>;
}

export const useAccounts = () => useContext(AccountsContext);
