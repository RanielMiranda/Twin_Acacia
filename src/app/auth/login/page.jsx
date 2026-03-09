"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAccounts } from "@/components/useclient/AccountsClient";
import { useToast } from "@/components/ui/toast/ToastProvider";
import Toast from "@/components/ui/toast/Toast";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAccounts();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [isSubmittingRecovery, setIsSubmittingRecovery] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [forgotData, setForgotData] = useState({
    email: "",
    message: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const account = await signIn(formData.email, formData.password);
      if (!account.setup_complete && account.setup_token) {
        router.push(`/auth/setup-resort?token=${encodeURIComponent(account.setup_token)}`);
        return;
      }
      const nextPath = searchParams.get("next");
      if (nextPath) {
        router.push(nextPath);
        return;
      }
      if ((account.role || "").toLowerCase() === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/owner/dashboard");
      }
    } catch (error) {
      toast({ message: error.message || "Login failed.", color: "red" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingRecovery(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(forgotData),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.error || "Failed to send request.");
      toast({ message: "Recovery request sent to admin.", color: "green" });
      setForgotData({ email: "", message: "" });
      setShowForgotModal(false);
    } catch (error) {
      toast({ message: error.message || "Failed to send request.", color: "red" });
    } finally {
      setIsSubmittingRecovery(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {isLoading && (
        <div className="fixed inset-0 z-[120] bg-slate-900/35 backdrop-blur-[2px] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl px-6 py-5 flex items-center gap-3 border border-slate-100">
            <Loader2 className="animate-spin text-blue-600" size={20} />
            <div className="text-sm font-semibold text-slate-700">Signing in, please wait...</div>
          </div>
        </div>
      )}
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 mb-4">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Twin Acacia</h1>
          <p className="text-slate-500 mt-2 font-medium">
            Internal Admin Portal
          </p>
        </div>

        <Card className="p-8 bg-white border-slate-200 shadow-xl rounded-3xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white transition-all"
                  placeholder="admin@twinacacia.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white transition-all"
                  placeholder="Click enter to login"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 text-lg font-semibold shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                "Enter Dashboard"
              )}
            </Button>
          </form>
        </Card>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
              <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="your@email.com"
                    value={forgotData.email}
                    onChange={(e) =>
                      setForgotData({ ...forgotData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Message (optional)</label>
                  <textarea
                    className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Add a note for admin"
                    value={forgotData.message}
                    onChange={(e) =>
                      setForgotData({ ...forgotData, message: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </button>
                  <Button type="submit" disabled={isSubmittingRecovery}>
                    {isSubmittingRecovery ? "Sending..." : "Send Request"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Toast />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LoginPageContent />
    </Suspense>
  );
}
