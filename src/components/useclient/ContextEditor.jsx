import { createContext, useContext, useState } from "react";
import { resorts } from "@/components/data/resorts";

const ResortContext = createContext();

export const ResortProvider = ({ children }) => {
  const [resort, setResort] = useState(resorts[0]); // default or empty template

  const updateResort = (field, value) => {
    setResort(prev => ({
      ...prev,
      [field]: value
    }));
    console.log("hi");
  };

  // Safe nested updater (for objects inside resort)
  const updateNested = (parentField, updatedValue) => {
    setResort(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        ...updatedValue
      }
    }));
  };

  // Safe image helper (prevents empty string bug)
  const safeSrc = (url) => {
    if (!url || typeof url !== "string") return null;
    if (url.trim() === "") return null;
    return url;
  };

  return (
    <ResortContext.Provider
      value={{
        resort,
        setResort,
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
