"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, ShieldCheck, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/components/useclient/AccountsClient";
import { useToast } from "@/components/ui/toast/ToastProvider";
import Toast from "@/components/ui/toast/Toast";

export default function EditAccountPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { getAccountById, updateAccount, activeAccount } = useAccounts();
  const isLoggedAdmin = (activeAccount?.role || "").toLowerCase() === "admin";

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "owner",
    status: "pending",
    setup_token: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const row = await getAccountById(id);
        if (!row) return;
        setForm({
          full_name: row.full_name || "",
          email: row.email || "",
          phone: row.phone || "",
          password: row.password || "",
          role: row.role || "owner",
          status: row.status || "pending",
          setup_token: row.setup_token || "",
        });
      } catch (error) {
        toast({ message: `Load failed: ${error.message}`, color: "red" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getAccountById, id, toast]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateAccount(id, {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: form.role,
        status: form.status,
      });
      toast({ message: "Account updated.", color: "green" });
    } catch (error) {
      toast({ message: `Save failed: ${error.message}`, color: "red" });
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading account...</div>;

  return (
    <div className="p-8 max-w-4xl mt-10 mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center text-slate-500 hover:text-slate-900 mb-6 font-bold text-sm transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to Accounts
      </button>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50">
          <h1 className="text-2xl font-black text-slate-900">Edit Account Profile</h1>
          <p className="text-slate-500">Updating account ID: #{id}</p>
        </div>

        <form className="p-8 space-y-6" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Full Name" value={form.full_name} onChange={(value) => setForm((prev) => ({ ...prev, full_name: value }))} />
            <Field label="Email Address" value={form.email} onChange={(value) => setForm((prev) => ({ ...prev, email: value }))} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Password" value={form.password} onChange={(value) => setForm((prev) => ({ ...prev, password: value }))} />
            <Field label="Contact Number" value={form.phone} onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))} />
          </div>

          {isLoggedAdmin && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Role</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, role: "owner" }))}
                      className={`flex-1 p-3 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 ${
                        form.role === "owner" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600"
                      }`}
                    >
                      <UserCircle size={16} /> Owner
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, role: "admin" }))}
                      className={`flex-1 p-3 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2 ${
                        form.role === "admin" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"
                      }`}
                    >
                      <ShieldCheck size={16} /> Admin
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase text-slate-400 mb-1">Resort Details Setup Link</p>
                <p className="text-sm font-medium text-slate-700 break-all">
                  {form.setup_token ? `/auth/setup-resort?token=${form.setup_token}` : "No setup token found."}
                </p>
                {form.setup_token && (
                  <button
                    type="button"
                    className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                    onClick={() => {
                      const setupLink = `/auth/setup-resort?token=${form.setup_token}`;
                      console.info("Manual setup link:", setupLink);
                      router.push(setupLink);
                    }}
                  >
                    Open setup-resort
                  </button>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end pt-4">
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white px-8 h-12 rounded-2xl font-bold shadow-lg shadow-blue-100">
              <Save size={18} className="mr-2" /> Save Changes
            </Button>
          </div>
        </form>
      </div>
      <Toast />
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase text-slate-400 ml-1">{label}</label>
      <input
        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
