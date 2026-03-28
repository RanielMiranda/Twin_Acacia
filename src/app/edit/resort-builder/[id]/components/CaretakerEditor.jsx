"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useResort } from "@/components/useclient/ContextEditor";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast/ToastProvider";

const withCaretakerIds = (items = []) =>
  items.map((caretaker) => ({
    ...caretaker,
    id: caretaker.id || `caretaker-${crypto.randomUUID()}`,
  }));

function CaretakerRow({
  caretaker,
  index,
  updateCaretakerLocal,
  commitCaretaker,
  removeCaretaker,
}) {
  return (
    <div className="grid grid-cols-12 px-6 py-4 border-t border-slate-100 hover:bg-blue-50/40 transition group items-center bg-white">
      <div className="col-span-5">
        <input
          className="w-full font-semibold bg-transparent border-none p-0 focus:ring-0 focus:text-sky-700"
          value={caretaker.name}
          placeholder="caretaker_name"
          onChange={(e) => updateCaretakerLocal(index, "name", e.target.value)}
          onBlur={commitCaretaker}
        />
      </div>
      <div className="col-span-6">
        <input
          className="w-full text-sm text-slate-500 bg-transparent border-none p-0 focus:ring-0"
          value={caretaker.phone}
          placeholder="09xx xxx xxxx"
          onChange={(e) => updateCaretakerLocal(index, "phone", e.target.value)}
          onBlur={commitCaretaker}
        />
      </div>
      <div className="col-span-1 flex justify-end">
        <button
          onClick={() => removeCaretaker(index)}
          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition"
          aria-label="Remove caretaker"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function CaretakerEditor() {
  const { resort } = useResort();
  const { toast } = useToast();
  const [localCaretakers, setLocalCaretakers] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const caretakers = localCaretakers ?? withCaretakerIds([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!resort?.id) {
        setLocalCaretakers([]);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("resort_caretakers")
        .select("id, name, phone")
        .eq("resort_id", Number(resort.id))
        .order("created_at", { ascending: true });
      if (!cancelled) {
        if (error) {
          toast({ message: "Failed to load caretakers.", color: "red" });
          setLocalCaretakers([]);
        } else {
          setLocalCaretakers(withCaretakerIds(data || []));
        }
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [resort?.id, toast]);

  const scrollToCenter = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const addCaretaker = () => {
    if (!resort?.id) return;
    const updated = [
      ...caretakers,
      {
        id: `temp-${crypto.randomUUID()}`,
        name: "",
        phone: "",
        isNew: true,
      },
    ];
    setLocalCaretakers(updated);
    setTimeout(scrollToCenter, 100);
  };

  const updateCaretakerLocal = (index, field, value) => {
    const updated = [...caretakers];
    updated[index] = { ...updated[index], [field]: value };
    setLocalCaretakers(updated);
  };

  const commitCaretaker = async () => {
    if (!resort?.id) return;
    const invalid = caretakers.some(
      (entry) => !String(entry.name || "").trim() || !String(entry.phone || "").trim()
    );
    if (invalid) {
      toast({ message: "Caretaker name and phone are required.", color: "amber" });
      return;
    }
    setBusy(true);
    try {
      const existing = caretakers.filter((c) => !String(c.id).startsWith("temp-"));
      const pending = caretakers.filter((c) => String(c.id).startsWith("temp-"));

      if (pending.length > 0) {
        const payload = pending.map((c) => ({
          resort_id: Number(resort.id),
          name: String(c.name || "").trim(),
          phone: String(c.phone || "").trim(),
        }));
        const { data, error } = await supabase
          .from("resort_caretakers")
          .insert(payload)
          .select("id, name, phone");
        if (error) throw error;
        setLocalCaretakers(withCaretakerIds([...(data || []), ...existing]));
      }

      if (existing.length > 0) {
        await Promise.all(
          existing.map(async (entry) =>
            supabase
              .from("resort_caretakers")
              .update({
                name: String(entry.name || "").trim(),
                phone: String(entry.phone || "").trim(),
              })
              .eq("id", entry.id)
          )
        );
      }
    } catch (error) {
      toast({ message: "Failed to save caretakers.", color: "red" });
    } finally {
      setBusy(false);
    }
  };

  const removeCaretaker = async (index) => {
    const target = caretakers[index];
    if (!target) return;
    if (String(target.id).startsWith("temp-")) {
      setLocalCaretakers(caretakers.filter((_, i) => i !== index));
      return;
    }
    if (!window.confirm(`Remove "${target.name || "caretaker"}"?`)) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from("resort_caretakers")
        .delete()
        .eq("id", target.id);
      if (error) throw error;
      setLocalCaretakers(caretakers.filter((_, i) => i !== index));
    } catch (error) {
      toast({ message: "Failed to remove caretaker.", color: "red" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div id="caretakers" className="max-w-6xl mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold">Caretakers</h2>
          <p className="text-xs text-slate-500">
            Phone notifications are sent when a stay is confirmed.
          </p>
        </div>
        <Button
          onClick={addCaretaker}
          className="rounded-full hover:scale-105 bg-sky-700 hover:bg-sky-800 text-white flex items-center justify-center"
          disabled={busy || !resort?.id}
        >
          <Plus size={16} className="mr-2" />
          Add Caretaker
        </Button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-12 bg-slate-50 text-sm font-semibold text-slate-600 px-6 py-4">
          <div className="col-span-5">Caretaker</div>
          <div className="col-span-6">Phone Number</div>
          <div className="col-span-1"></div>
        </div>

        {loading ? (
          <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-400">
            Loading caretakers...
          </div>
        ) : caretakers.length === 0 ? (
          <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-400">
            No caretakers added yet.
          </div>
        ) : (
          caretakers.map((caretaker, index) => (
            <CaretakerRow
              key={caretaker.id}
              caretaker={caretaker}
              index={index}
              updateCaretakerLocal={updateCaretakerLocal}
              commitCaretaker={commitCaretaker}
              removeCaretaker={removeCaretaker}
            />
          ))
        )}

        <div className="border-t border-slate-100 px-6 py-3">
          <button
            onClick={addCaretaker}
            className="text-sm hover:scale-105 text-sky-700 font-semibold hover:text-sky-800 transition"
            disabled={busy || !resort?.id}
          >
            + Add another caretaker
          </button>
        </div>

        <div ref={endRef} />
      </div>
    </div>
  );
}
