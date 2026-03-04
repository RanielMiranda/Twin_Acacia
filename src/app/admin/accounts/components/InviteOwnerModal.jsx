"use client";

import React, { useState } from "react";
import { X, User, Shield, CheckCircle2, ArrowRight, ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { useAccounts } from "@/components/useclient/AccountsClient";

export default function InviteOwnerModal({ isOpen, onClose }) {
  const { toast } = useToast();
  const { createAccountInvite } = useAccounts();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "owner",
  });

  if (!isOpen) return null;

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSendInvite = async () => {
    setSubmitting(true);
    try {
      const { setupLink } = await createAccountInvite({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });
      console.info(`Account setup link (${formData.role}):`, setupLink);
      toast({
        message: "Invite created. Setup link was logged to browser console.",
        color: "green",
        icon: CheckCircle2,
      });
      onClose();
      setStep(1);
      setFormData({ fullName: "", email: "", phone: "", password: "", role: "owner" });
    } catch (error) {
      toast({ message: `Invite failed: ${error.message}`, color: "red" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 pb-0 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add Account</h2>
            <p className="text-slate-500 font-medium">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="px-8 mt-6">
          <div className="flex gap-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex-1 transition-all duration-500 rounded-full ${step >= i ? "bg-blue-600" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-black uppercase text-slate-400 ml-1">Full Name</span>
                <input
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Account Name"
                />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase text-slate-400 ml-1">Email</span>
                <input
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="name@example.com"
                />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase text-slate-400 ml-1">Contact Number</span>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="+63..."
                />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase text-slate-400 ml-1">Temporary Password</span>
                <input
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Required for first login"
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Shield size={16} /> Role & Access
              </p>
              <label className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <input
                  type="radio"
                  checked={formData.role === "owner"}
                  onChange={() => setFormData((prev) => ({ ...prev, role: "owner" }))}
                />
                <span className="font-bold text-slate-700">Owner Account</span>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <input
                  type="radio"
                  checked={formData.role === "admin"}
                  onChange={() => setFormData((prev) => ({ ...prev, role: "admin" }))}
                />
                <span className="font-bold text-slate-700">Admin Account</span>
              </label>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
                Resort address/details are now configured in <strong>/auth/setup-resort</strong> after invite.
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <Building2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Ready to create account invite</h3>
              <p className="text-slate-500 mt-2">
                No email will be sent. The setup link will be logged in browser console.
              </p>
              <div className="mt-6 text-left p-4 rounded-2xl border border-slate-100 bg-slate-50">
                <p className="text-xs font-bold uppercase text-slate-400">Summary</p>
                <p className="text-sm font-semibold text-slate-800">{formData.fullName}</p>
                <p className="text-sm text-slate-600">{formData.email}</p>
                <p className="text-xs font-bold uppercase text-blue-600 mt-2">{formData.role}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 pt-0 flex gap-3">
          {step > 1 && (
            <Button variant="ghost" onClick={prevStep} className="flex-1 h-12 rounded-2xl font-bold text-slate-500">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          <Button
            disabled={submitting}
            onClick={step === 3 ? handleSendInvite : nextStep}
            className={`flex items-center justify-center h-12 rounded-2xl font-bold shadow-lg transition-all ${
              step === 3 ? "bg-green-500 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {step === 3 ? (submitting ? "Creating..." : "Create Invite") : "Continue"}
            {step < 3 && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

