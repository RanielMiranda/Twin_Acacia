"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Footer() {
  const [resorts, setResorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResorts = async () => {
      const { data, error } = await supabase
        .from("resorts")
        .select("id, name, contactPhone, contactEmail")
        .order("created_at", { ascending: false })
        .limit(3);
      if (!error && data) {
        setResorts(data);
      }
      setLoading(false);
    };
    fetchResorts();
  }, []);

  return (
    <footer id="about" className="border-t border-slate-200 bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_100%)] text-slate-500">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* About Twin Acacia */}
        <div className="mb-8 md:mb-10">
          <h3 className="mb-4 text-lg font-semibold text-slate-950">Twin Acacia</h3>
          <p className="max-w-xs text-sm leading-6 text-slate-600">
            Browse resorts, check availability, and send inquiries through a simple and seamless booking experience.
          </p>
        {/* Resort contact list */}
        {loading ? (
          <p className="text-sm text-slate-400">Loading resorts...</p>
        ) : resorts.length === 0 ? (
          <p className="text-sm text-slate-400">No resorts available.</p>
        ) : (
          <>
            {/* Row 2: first 3 resorts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {resorts.slice(0, 3).map((resort) => (
                <div key={resort.id}>
                  <h4 className="font-bold text-slate-900 mb-1">{resort.name}</h4>
                  <p className="text-sm text-slate-600">{resort.contactPhone}</p>
                  <p className="text-sm text-slate-600">{resort.contactEmail}</p>
                </div>
              ))}
            </div>
            {/* Row 3: next 3 resorts if available */}
            {resorts.length > 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {resorts.slice(3, 6).map((resort) => (
                  <div key={resort.id}>
                    <h4 className="font-bold text-slate-900 mb-1">{resort.name}</h4>
                    <p className="text-sm text-slate-600">{resort.contactPhone}</p>
                    <p className="text-sm text-slate-600">{resort.contactEmail}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>          
        </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-6 py-4 text-xs text-slate-500 md:flex-row">
          <p>(c) {new Date().getFullYear()} Twin Acacia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
