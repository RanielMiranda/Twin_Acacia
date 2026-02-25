"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { BUCKET_NAME } from "@/lib/utils";

const ResortContext = createContext();

export const ResortProvider = ({ children }) => {
  const [resort, setResort] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Persistence: Load draft from LocalStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("resort_builder_draft");
    if (savedDraft && !resort) {
      try {
        setResort(JSON.parse(savedDraft));
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  // 2. Persistence: Save to LocalStorage
  useEffect(() => {
    if (resort) {
      localStorage.setItem("resort_builder_draft", JSON.stringify(resort));
    }
  }, [resort]);

  const resetResort = useCallback((initialData = null) => {
    localStorage.removeItem("resort_builder_draft");
    setResort(initialData);
  }, []);

  const loadResort = useCallback(async (identifier, isId = true) => {
    if (!identifier) return;
    setLoading(true);
    const column = isId ? "id" : "name";
    try {
      const { data, error } = await supabase.from("resorts").select("*").eq(column, identifier).single();
      if (error) throw error;
      setResort(data);
    } catch (err) {
      console.error("Error loading:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImage = async (file, resortName, category, subFolder = "") => {
    if (!resortName) return null;
    const safeResortName = resortName.replace(/\s+/g, "-").toLowerCase();
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    let path = `${safeResortName}/${category}`;
    if (subFolder) path += `/${subFolder.replace(/\s+/g, "-").toLowerCase()}`;
    path += `/${fileName}`;

    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(path, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return urlData.publicUrl;
  };

  const setVisibility = useCallback(async (resortId, visible) => {
    if (!resortId) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("resorts")
        .update({ visible })
        .eq("id", resortId);
      if (error) throw error;

      // Update local state if the resort being edited is the current one
      if (resort?.id === resortId) setResort({ ...resort, visible });

      return true;
    } catch (err) {
      console.error("Failed to update visibility:", err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [resort]);
  

  const saveResort = useCallback(async () => {
    if (!resort) return;

    setLoading(true);

    try {
      const rName = resort.name;
      const safeResortName = rName.replace(/\s+/g, "-").toLowerCase();

      // Fetch existing resort to compare old images
      const { data: existingResort } = await supabase
        .from("resorts")
        .select("gallery")
        .eq("id", resort.id)
        .single();

      const oldGallery = existingResort?.gallery || [];

      // Upload profile image
      const updatedProfileImage =
        resort.profileImage instanceof File
          ? await uploadImage(resort.profileImage, rName, "profileImage")
          : resort.profileImage;

      // Upload hero/gallery images
      const updatedGallery = await Promise.all(
        (resort.gallery || []).map(async (item) =>
          item instanceof File
            ? await uploadImage(item, rName, "hero")
            : item
        )
      );

      // Delete removed gallery images from storage
      const removedImages = oldGallery.filter(
        (img) => !updatedGallery.includes(img)
      );

      if (removedImages.length > 0) {
        const pathsToDelete = removedImages.map((url) => {
          const urlParts = url.split(
            `/storage/v1/object/public/${BUCKET_NAME}/`
          );
          return urlParts[1];
        });

        await supabase.storage.from(BUCKET_NAME).remove(pathsToDelete);
      }

      // Facilities
      const updatedFacilities = await Promise.all(
        (resort.facilities || []).map(async (f) => ({
          ...f,
          image:
            f.image instanceof File
              ? await uploadImage(f.image, rName, "facilities")
              : f.image,
        }))
      );

      // Rooms
      const updatedRooms = await Promise.all(
        (resort.rooms || []).map(async (room) => ({
          ...room,
          gallery: await Promise.all(
            (room.gallery || []).map(async (img) =>
              img instanceof File
                ? await uploadImage(img, rName, "rooms", room.name)
                : img
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

      const { error } = await supabase
        .from("resorts")
        .upsert(finalPayload);

      if (error) throw error;

      setResort(finalPayload);
      localStorage.removeItem("resort_builder_draft");

      return true;
    } catch (err) {
      alert("Error saving: " + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [resort]);

  const updateResort = (field, value) => setResort(prev => ({ ...prev, [field]: value }));
  const safeSrc = (src) => (src instanceof File ? URL.createObjectURL(src) : src);

  return (
  <ResortContext.Provider
    value={{
      resort,
      setResort,
      loading,
      loadResort,
      saveResort,
      updateResort,
      safeSrc,
      resetResort,
      setVisibility,
    }}
  >
    {children}
  </ResortContext.Provider>
  );
};

export const useResort = () => useContext(ResortContext);