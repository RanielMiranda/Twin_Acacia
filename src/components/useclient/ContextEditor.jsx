"use client";

import { createContext, useContext, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BUCKET_NAME } from "@/lib/utils";

const ResortContext = createContext();

export const ResortProvider = ({ children }) => {
  const [resort, setResort] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch a specific resort by ID or Name (for the Public Page)
  const loadResort = async (identifier, isId = true) => {
    setLoading(true);
    const column = isId ? "id" : "name";
    
    try {
      const { data, error } = await supabase
        .from("resorts")
        .select("*")
        .eq(column, identifier)
        .single();

      if (error) throw error;
      setResort(data);
    } catch (err) {
      console.error("Error loading resort:", err.message);
      setResort(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Save current state to Supabase (Upsert)
  const saveResort = async () => {
    if (!resort) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("resorts")
        .upsert(resort)
        .select();

      if (error) throw error;
      alert("Changes saved to database successfully!");
    } catch (err) {
      alert("Error saving: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Generic State Updaters
  const updateResort = (field, value) => {
    setResort((prev) => ({ ...prev, [field]: value }));
  };

  const updateNested = (parentField, updatedValue) => {
    setResort((prev) => ({
      ...prev,
      [parentField]: { ...prev[parentField], ...updatedValue },
    }));
  };

  // 🔹 Global Storage Upload Logic
  // Matches your requested structure: resort-images/[name]/[category]/[sub]/file
  const uploadImage = async (file, category, subFolder = "") => {
    if (!resort?.name) {
      alert("Please set a resort name first to organize storage.");
      return null;
    }

    const safeName = resort.name.replace(/\s+/g, "-").toLowerCase();
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    
    // Construct path based on your requirements
    let path = `${safeName}/${category}`;
    if (subFolder) path += `/${subFolder.replace(/\s+/g, "-").toLowerCase()}`;
    path += `/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file);

      if (error) throw error;

      // Return the Public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);

      return urlData.publicUrl;
    } catch (err) {
      console.error("Upload error:", err.message);
      return null;
    }
  };

  const safeSrc = (url) => {
    if (!url || typeof url !== "string" || url.trim() === "") return null;
    return url;
  };

  return (
    <ResortContext.Provider
      value={{
        resort,
        setResort,
        loading,
        loadResort,
        saveResort,
        updateResort,
        updateNested,
        uploadImage,
        safeSrc,
      }}
    >
      {children}
    </ResortContext.Provider>
  );
};

export const useResort = () => useContext(ResortContext);