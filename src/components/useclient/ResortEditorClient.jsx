"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BUCKET_NAME } from "@/lib/utils";
import { useResortData } from "./ResortDataClient";

const ResortEditorContext = createContext(null);
const LEGACY_DRAFT_KEY = "resort_builder_draft";
const DRAFT_SCOPE_KEY = "resort_builder_draft_scope";

const draftStorageKey = (scope) => `resort_builder_draft:${scope || "new"}`;
const RESORT_DB_COLUMNS = [
  "id",
  "name",
  "location",
  "visible",
  "price",
  "contactPhone",
  "contactEmail",
  "contactMedia",
  "profileImage",
  "description",
  "extraServices",
  "facilities",
  "tags",
  "gallery",
  "rooms",
];
const sanitizeSegment = (value) =>
  String(value || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_\s]/g, "")
    .replace(/\s+/g, "-");

const toStoragePathFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
};

const toResortDbPayload = (resort) =>
  RESORT_DB_COLUMNS.reduce((acc, key) => {
    if (resort?.[key] !== undefined) acc[key] = resort[key];
    return acc;
  }, {});

const collectResortImageUrls = (resortLike) => {
  const urls = new Set();
  if (!resortLike) return urls;

  if (typeof resortLike.profileImage === "string" && resortLike.profileImage) {
    urls.add(resortLike.profileImage);
  }
  (resortLike.gallery || []).forEach((img) => {
    if (typeof img === "string" && img) urls.add(img);
  });
  (resortLike.facilities || []).forEach((facility) => {
    if (typeof facility?.image === "string" && facility.image) urls.add(facility.image);
  });
  (resortLike.rooms || []).forEach((room) => {
    (room?.gallery || []).forEach((img) => {
      if (typeof img === "string" && img) urls.add(img);
    });
  });
  return urls;
};

const convertImageFileToWebp = async (file) => {
  if (!file || !(file instanceof File) || !file.type?.startsWith("image/")) return file;
  if (typeof window === "undefined") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    if (!blob) return file;
    const base = file.name.replace(/\.[^.]+$/, "") || `image-${Date.now()}`;
    return new File([blob], `${base}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
};

export function ResortEditorProvider({ children }) {
  const { fetchResortByIdentifier } = useResortData();
  const [resort, setResort] = useState(null);
  const [loading, setLoading] = useState(false);
  const [draftScope, setDraftScopeState] = useState("new");

  const setDraftScope = useCallback((scope) => {
    const nextScope = scope || "new";
    setDraftScopeState(nextScope);
    if (typeof window !== "undefined") {
      localStorage.setItem(DRAFT_SCOPE_KEY, nextScope);
    }
  }, []);

  const readDraftByScope = useCallback((scope) => {
    if (typeof window === "undefined") return null;
    const key = draftStorageKey(scope);
    const scopedRaw = localStorage.getItem(key);
    if (scopedRaw) return JSON.parse(scopedRaw);
    if (scope === "new") {
      const legacyRaw = localStorage.getItem(LEGACY_DRAFT_KEY);
      if (legacyRaw) return JSON.parse(legacyRaw);
    }
    return null;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedScope = localStorage.getItem(DRAFT_SCOPE_KEY) || "new";
    setDraftScopeState(savedScope);
    if (!resort) {
      try {
        const savedDraft = readDraftByScope(savedScope);
        if (savedDraft) setResort(savedDraft);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, [readDraftByScope, resort]);

  useEffect(() => {
    if (!resort || typeof window === "undefined") return;
    localStorage.setItem(draftStorageKey(draftScope), JSON.stringify(resort));
    // Keep legacy key for backwards compatibility while migrating old drafts.
    localStorage.setItem(LEGACY_DRAFT_KEY, JSON.stringify(resort));
  }, [draftScope, resort]);

  const resetResort = useCallback((initialData = null, scope = "new") => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(draftStorageKey(draftScope));
      if (scope === "new") {
        localStorage.removeItem(LEGACY_DRAFT_KEY);
      }
    }
    setDraftScope(scope);
    setResort(initialData);
  }, [draftScope, setDraftScope]);

  const loadResort = useCallback(
    async (identifier, isId = true) => {
      if (!identifier) return;
      const scope = isId ? `id:${identifier}` : `name:${identifier}`;
      setDraftScope(scope);
      const identifierText = String(identifier).trim();
      if (typeof window !== "undefined") {
        try {
          const cachedDraft = readDraftByScope(scope);
          const draftMatchesTarget = isId
            ? String(cachedDraft?.id ?? "").trim() === identifierText
            : String(cachedDraft?.name ?? "").trim().toLowerCase() === identifierText.toLowerCase();
          const hasMinimumFields = !!cachedDraft?.name || !!cachedDraft?.id;
          if (cachedDraft && hasMinimumFields && draftMatchesTarget) {
            setResort(cachedDraft);
            return;
          }
          if (cachedDraft && (!hasMinimumFields || !draftMatchesTarget)) {
            localStorage.removeItem(draftStorageKey(scope));
          }
        } catch (e) {
          console.error("Failed to parse resort scoped draft", e);
        }
      }
      setLoading(true);
      try {
        const data = await fetchResortByIdentifier(identifier, isId);
        if (data) setResort(data);
      } finally {
        setLoading(false);
      }
    },
    [fetchResortByIdentifier, readDraftByScope, setDraftScope]
  );

  const uploadImage = async (file, resortName, category, subFolder = "") => {
    if (!resortName) return null;
    const normalizedFile = await convertImageFileToWebp(file);
    const safeResortName = resortName.replace(/\s+/g, "-").toLowerCase();
    const fileName = `${Date.now()}-${normalizedFile.name.replace(/\s+/g, "-")}`;
    let path = `${safeResortName}/${category}`;
    if (subFolder) path += `/${subFolder.replace(/\s+/g, "-").toLowerCase()}`;
    path += `/${fileName}`;

    const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, normalizedFile, {
      contentType: normalizedFile.type || "image/webp",
    });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return urlData.publicUrl;
  };

  const setVisibility = useCallback(
    async (resortId, visible) => {
      if (!resortId) return false;
      setLoading(true);
      try {
        const { error } = await supabase.from("resorts").update({ visible }).eq("id", resortId);
        if (error) throw error;
        if (resort?.id === resortId) setResort({ ...resort, visible });
        return true;
      } catch (err) {
        console.error("Failed to update visibility:", err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [resort]
  );

  const listStorageFilesRecursively = useCallback(async (prefix) => {
    const filePaths = [];
    const walk = async (folderPath) => {
      let offset = 0;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabase.storage.from(BUCKET_NAME).list(folderPath, {
          limit: 100,
          offset,
          sortBy: { column: "name", order: "asc" },
        });
        if (error) throw error;
        const entries = data || [];
        for (const entry of entries) {
          const currentPath = folderPath ? `${folderPath}/${entry.name}` : entry.name;
          if (entry.id) {
            filePaths.push(currentPath);
          } else {
            await walk(currentPath);
          }
        }
        hasMore = entries.length === 100;
        offset += 100;
      }
    };
    if (prefix) await walk(prefix);
    return filePaths;
  }, []);

  const deleteResort = useCallback(
    async (resortId) => {
      if (!resortId) return { ok: false, error: "Missing resort id." };
      setLoading(true);
      try {
        const { data: resortRow, error: resortError } = await supabase
          .from("resorts")
          .select("id, name, profileImage, gallery, facilities, rooms")
          .eq("id", Number(resortId))
          .single();
        if (resortError) throw resortError;
        if (!resortRow) throw new Error("Resort not found.");

        const explicitPaths = new Set();
        const addUrlPath = (value) => {
          const path = toStoragePathFromUrl(value);
          if (path) explicitPaths.add(path);
        };
        addUrlPath(resortRow.profileImage);
        (resortRow.gallery || []).forEach(addUrlPath);
        (resortRow.facilities || []).forEach((facility) => addUrlPath(facility?.image));
        (resortRow.rooms || []).forEach((room) => (room?.gallery || []).forEach(addUrlPath));

        const safeResortName = sanitizeSegment(resortRow.name);
        const [resortAssetPaths, bookingProofPaths] = await Promise.all([
          listStorageFilesRecursively(safeResortName),
          listStorageFilesRecursively(`resort-bookings/${safeResortName}`),
        ]);

        const allPaths = Array.from(new Set([...explicitPaths, ...resortAssetPaths, ...bookingProofPaths])).filter(Boolean);
        if (allPaths.length > 0) {
          for (let i = 0; i < allPaths.length; i += 100) {
            const chunk = allPaths.slice(i, i + 100);
            const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove(chunk);
            if (storageError) throw storageError;
          }
        }

        await supabase.from("bookings").delete().eq("resort_id", Number(resortId));
        const { error: deleteResortError } = await supabase.from("resorts").delete().eq("id", Number(resortId));
        if (deleteResortError) throw deleteResortError;

        if (typeof window !== "undefined") {
          localStorage.removeItem(draftStorageKey(`id:${resortId}`));
          if (resort?.id?.toString() === resortId.toString()) {
            localStorage.removeItem(draftStorageKey(draftScope));
            localStorage.removeItem(LEGACY_DRAFT_KEY);
            setResort(null);
          }
        }
        return { ok: true };
      } catch (err) {
        console.error("Failed to delete resort:", err.message);
        return { ok: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [draftScope, listStorageFilesRecursively, resort?.id]
  );

  const saveResort = useCallback(async () => {
    if (!resort) return false;
    setLoading(true);
    try {
      const rName = resort.name;
      const { data: existingResort } = await supabase
        .from("resorts")
        .select("profileImage, gallery, facilities, rooms")
        .eq("id", resort.id)
        .single();

      const updatedProfileImage =
        resort.profileImage instanceof File
          ? await uploadImage(resort.profileImage, rName, "profileImage")
          : resort.profileImage;

      const updatedGallery = await Promise.all(
        (resort.gallery || []).map(async (item) =>
          item instanceof File ? await uploadImage(item, rName, "hero") : item
        )
      );

      const updatedFacilities = await Promise.all(
        (resort.facilities || []).map(async (facility) => ({
          ...facility,
          image:
            facility.image instanceof File
              ? await uploadImage(facility.image, rName, "facilities")
              : facility.image,
        }))
      );

      const updatedRooms = await Promise.all(
        (resort.rooms || []).map(async (room) => ({
          ...room,
          gallery: await Promise.all(
            (room.gallery || []).map(async (img) =>
              img instanceof File ? await uploadImage(img, rName, "rooms", room.name) : img
            )
          ),
        }))
      );

      const finalPayload = {
        ...resort,
        profileImage: updatedProfileImage,
        gallery: updatedGallery,
        facilities: updatedFacilities,
        rooms: updatedRooms,
      };
      const dbPayload = toResortDbPayload(finalPayload);

      const { error } = await supabase.from("resorts").upsert(dbPayload);
      if (error) throw error;

      // Delete orphaned images: old URLs no longer referenced by latest saved payload.
      const oldUrls = collectResortImageUrls(existingResort || {});
      const newUrls = collectResortImageUrls(finalPayload);
      const orphanedPaths = Array.from(oldUrls)
        .filter((url) => !newUrls.has(url))
        .map((url) => toStoragePathFromUrl(url))
        .filter(Boolean);

      if (orphanedPaths.length > 0) {
        const uniquePaths = Array.from(new Set(orphanedPaths));
        for (let i = 0; i < uniquePaths.length; i += 100) {
          const chunk = uniquePaths.slice(i, i + 100);
          const { error: removeError } = await supabase.storage.from(BUCKET_NAME).remove(chunk);
          if (removeError) {
            console.error("Failed to delete orphaned images:", removeError.message);
          }
        }
      }

      setResort(finalPayload);
      if (typeof window !== "undefined") {
        localStorage.removeItem(draftStorageKey(draftScope));
        localStorage.removeItem(LEGACY_DRAFT_KEY);
      }
      return true;
    } catch (err) {
      alert("Error saving: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [draftScope, resort]);

  const updateResort = useCallback((fieldOrUpdater, value) => {
    if (typeof fieldOrUpdater === "function") {
      setResort((prev) => fieldOrUpdater(prev));
      return;
    }
    setResort((prev) => ({ ...prev, [fieldOrUpdater]: value }));
  }, []);
  const safeSrc = (src) => (src instanceof File ? URL.createObjectURL(src) : src);

  const value = useMemo(
    () => ({
      resort,
      setResort,
      loading,
      loadResort,
      saveResort,
      updateResort,
      safeSrc,
      resetResort,
      setVisibility,
      deleteResort,
      uploadImage,
      draftScope,
      setDraftScope,
    }),
    [deleteResort, draftScope, loadResort, loading, resetResort, resort, saveResort, setDraftScope, setVisibility, updateResort]
  );

  return <ResortEditorContext.Provider value={value}>{children}</ResortEditorContext.Provider>;
}

export const useResort = () => useContext(ResortEditorContext);
