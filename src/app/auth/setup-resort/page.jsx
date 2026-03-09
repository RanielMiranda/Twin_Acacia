"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { Lock, Camera, CheckCircle2, ArrowRight, Loader2, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccounts } from "@/components/useclient/AccountsClient";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { supabase } from "@/lib/supabase";
import { BUCKET_NAME } from "@/lib/utils";

function SetupResortPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { getAccountBySetupToken, completeSetup } = useAccounts();

  const token = searchParams.get("token");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [account, setAccount] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const photoPreview = useMemo(() => {
    if (photoFile) return URL.createObjectURL(photoFile);
    return account?.profile_image || "";
  }, [account?.profile_image, photoFile]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const row = await getAccountBySetupToken(token);
        setAccount(row);
      } catch (error) {
        toast({ message: `Invalid setup token: ${error.message}`, color: "red" });
      }
    };
    load();
  }, [getAccountBySetupToken, token, toast]);

  const uploadProfilePhoto = async () => {
    if (!photoFile || !account?.id) return account?.profile_image || null;
    const ext = (photoFile.name?.split(".").pop() || "jpg").toLowerCase();
    const path = `accounts/${account.id}/profile-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, photoFile, {
      upsert: true,
      contentType: photoFile.type || "image/jpeg",
    });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data?.publicUrl || null;
  };

  const handleCompleteSetup = async (e) => {
    e.preventDefault();
    if (!token) {
      toast({ message: "Missing setup token.", color: "red" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast({ message: "Password confirmation does not match.", color: "red" });
      return;
    }
    setIsSubmitting(true);
    try {
      const profileUrl = await uploadProfilePhoto();
      await completeSetup(token, {
        password: form.password,
        profile_image: profileUrl || account?.profile_image || null,
      });

      setIsFinished(true);
      setTimeout(() => {
        if ((account?.role || "").toLowerCase() === "admin") router.push("/admin/dashboard");
        else router.push("/owner/dashboard");
      }, 1200);
    } catch (error) {
      toast({ message: `Setup failed: ${error.message}`, color: "red" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFinished) return <SuccessState onGoHome={() => router.push("/owner/dashboard")} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <BrandingSidebar />

      <main className="flex-1 flex items-center justify-center p-6 lg:p-24">
        <div className="max-w-xl w-full">
          <FormHeader email={account?.email || "pending@invite"} />

          <form onSubmit={handleCompleteSetup} className="space-y-8">
            <PhotoUpload preview={photoPreview} onFile={(file) => setPhotoFile(file)} />

            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-2"><Building2 size={16} /> Assigned Resort</h4>
              <p className="text-sm font-semibold text-slate-800">{account?.resorts?.name || "No resort assigned yet"}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin size={12} />
                {account?.resorts?.location || "Admin will attach the resort from dashboard action menu."}
              </p>
            </div>

            <PasswordField
              label="Create Password"
              value={form.password}
              onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
            />
            <PasswordField
              label="Confirm Password"
              value={form.confirmPassword}
              onChange={(value) => setForm((prev) => ({ ...prev, confirmPassword: value }))}
            />

            <TermsCheckbox />

            <div className="bottom-0 bg-slate-50 pt-4 pb-6 mt-auto">
              <Button
                disabled={isSubmitting}
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-lg font-bold shadow-xl transition-all flex items-center justify-center gap-3"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <>Complete Setup <ArrowRight size={20} /></>}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <SetupResortPageContent />
    </Suspense>
  );
}

function BrandingSidebar() {
  return (
    <div className="lg:w-1/3 bg-blue-600 p-12 flex flex-col justify-between text-white relative overflow-hidden shrink-0">
      <div className="relative z-10">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-12">
          <Building2 size={28} />
        </div>
        <h1 className="text-4xl font-black mb-6 leading-tight">Account Setup</h1>
        <p className="text-blue-100 text-lg font-medium max-w-xs">
          Complete profile, password, and wait for admin resort assignment if needed.
        </p>
      </div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-50" />
    </div>
  );
}

function FormHeader({ email }) {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-black text-slate-900 mb-2">Setup Your Account</h2>
      <p className="text-slate-500 font-medium">Invite for <span className="text-slate-800 underline">{email}</span></p>
    </div>
  );
}

function PhotoUpload({ preview, onFile }) {
  return (
    <label className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm cursor-pointer">
      <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
        {preview ? <img src={preview} alt="Profile" className="w-full h-full object-cover" /> : <Camera size={32} />}
      </div>
      <div>
        <h4 className="font-bold text-slate-900">Profile Photo</h4>
        <p className="text-sm text-slate-500 mb-2">Upload photo (stored in Supabase bucket).</p>
        <span className="text-xs font-bold text-blue-600">Choose File</span>
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
    </label>
  );
}

function PasswordField({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase text-slate-400 ml-1">{label}</label>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        <input
          type="password"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="••••••••"
        />
      </div>
    </div>
  );
}

function TermsCheckbox() {
  return (
    <div className="flex items-start gap-3 px-1">
      <input type="checkbox" required className="mt-1 w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500" />
      <p className="text-sm text-slate-500 font-medium leading-relaxed">
        I agree to platform terms and account setup policy.
      </p>
    </div>
  );
}

function SuccessState({ onGoHome }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-12 text-center rounded-[40px] border-none shadow-2xl animate-in zoom-in-95">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">Setup Complete</h1>
        <p className="text-slate-500 mb-8 font-medium">Account credentials and profile are saved.</p>
        <Button onClick={onGoHome} className="w-full h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl text-lg font-bold shadow-lg">
          Go to Dashboard
        </Button>
      </Card>
    </div>
  );
}
