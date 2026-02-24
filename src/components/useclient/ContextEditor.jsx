import { createContext, useContext, useState } from "react";
import { resorts as localResortsData } from "@/components/data/resorts"; // Your temporary mock data

const ResortContext = createContext();

export const ResortProvider = ({ children }) => {
  const [resort, setResort] = useState(null); // Default to null to prevent "Wrong Resort" bugs
  const [loading, setLoading] = useState(false);

  // This function will eventually be your Supabase fetcher
  const loadResortById = async (id) => {
    setLoading(true);
    try {
      // CURRENT: Finding in local array
      const found = localResortsData.find(r => String(r.id) === String(id));
      
      // FUTURE (Supabase): 
      // const { data, error } = await supabase.from('resorts').select('*').eq('id', id).single();
      
      setResort(found || null);
    } catch (err) {
      console.error("Error loading resort:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateResort = (field, value) => {
    setResort(prev => ({ ...prev, [field]: value }));
  };

  const updateNested = (parentField, updatedValue) => {
    setResort(prev => ({
      ...prev,
      [parentField]: { ...prev[parentField], ...updatedValue }
    }));
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
        loadResortById, // Expose this to your components
        loading,
        updateResort,
        updateNested,
        safeSrc
      }}
    >
      {children}
    </ResortContext.Provider>
  );
};

export const useResort = () => useContext(ResortContext);