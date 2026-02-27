"use client";

import React, { useState } from "react";
import { X, User, Building2, Shield, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast/ToastProvider";

export default function InviteOwnerModal({ isOpen, onClose }) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "", email: "",
    resortName: "", location: "", plan: "Standard"
  });

  if (!isOpen) return null;

  const steps = [
    { id: 1, title: "Personal Info", icon: User },
    { id: 2, title: "Resort Details", icon: Building2 },
    { id: 3, title: "Access Level", icon: Shield },
  ];

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleFinalAction = () => {
    if (step === 3) {
      // 3. Logic: In production, this calls your API. 
      // For now, let's close the modal and go to the setup page.
      onClose();
      router.push("/owner/dashboard/"); 
    } else {
      nextStep();
    }
  };
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-8 pb-0 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Invite New Owner</h2>
            <p className="text-slate-500 font-medium">Step {step} of 3: {steps[step-1]?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-8 mt-6">
          <div className="flex gap-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex-1 transition-all duration-500 rounded-full ${step >= i ? 'bg-blue-600' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        <div className="p-8">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">First Name</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Email Address</label>
                <input type="email" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" placeholder="john@example.com" />
              </div>
            </div>
          )}

          {/* Step 2: Resort Details */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Resort Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none" placeholder="kasbah Villa" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Business Address</label>
                <textarea className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none h-24" placeholder="Street, City, Province..." />
              </div>
            </div>
          )}

          {/* Step 3: Success / Confirmation */}
          {step === 3 && (
            <div className="text-center py-6 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Ready to send invitation?</h3>
              <p className="text-slate-500 mt-2 px-10">An email will be sent to the owner with a secure link to set up their password and resort profile.</p>
              {/* 4. Added a direct link for testing purposes */}
          <div className="mt-4">
            <button 
              onClick={() => router.push("/auth/setup-resort")}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Preview setup page manually →
            </button>
          </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-2xl text-left border border-blue-100">
                <p className="text-xs font-bold text-blue-600 uppercase mb-1">Summary</p>
                <p className="text-sm font-medium text-slate-700">Owner: John Doe</p>
                <p className="text-sm font-medium text-slate-700">Resort: Kasbah Villa</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-8 pt-0 flex gap-3">
          {step > 1 && (
            <Button variant="ghost" onClick={prevStep} className="flex-1 flex items-center justif-center h-12 rounded-2xl font-bold text-slate-500">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          <Button 
            onClick={() => {
            if(step === 3){
              toast({
                message: "New email link has been sent to name@email.com",
                color: "green",
                icon: CheckCircle2
              });              
              onClose();
            } else {
              nextStep();
            }
            }}
            className={`flex items-center justify-center h-12 rounded-2xl font-bold shadow-lg transition-all ${
            step === 3 ? "bg-green-500 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {step === 3 ? "Send Invitation" : "Continue"} 
            {step < 3 && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}