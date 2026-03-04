"use client";

import React, { useEffect, useState } from "react";
import { X, Calendar, User, CheckCircle2, ArrowRight, ArrowLeft, Phone, MapPin, Clock, PlusCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFilters } from "@/components/useclient/ContextFilter";

export default function ContactOwnerModal({ isOpen, onClose, resort, onSubmitInquiry }) {
  const [agreed, setAgreed] = useState(false);
  const { guests, startDate, endDate, destination } = useFilters();
  // We can access resort data directly if not passed as prop, but prop is safer
  const [step, setStep] = useState(1);

  const formatDateForInput = (date) => {
    if (!date) return "";
    return date instanceof Date ? date.toISOString().split('T')[0] : date;
  };

  const formatTime = (time) => {
    if (!time) return "Not set";
    const [hours, minutes] = time.split(':');
    const h = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${h}:${minutes} ${ampm}`;
  };

  const [formData, setFormData] = useState({
    guestName: "",
    email: "",
    contactNumber: "",
    area: destination || "",
    adultCount: Number(guests?.adults || 0),
    childrenCount: Number(guests?.children || 0),
    pax: Number((guests?.adults || 0) + (guests?.children || 0)),
    guestCount: Number((guests?.adults || 0) + (guests?.children || 0)),
    sleepingGuests: 0,
    roomCount: 1,
    checkInDate: formatDateForInput(startDate),
    checkOutDate: formatDateForInput(endDate),
    checkInTime: "14:00",
    checkOutTime: "12:00",
    message: "",
    selectedServices: [], // Added to track extra services
  });

  useEffect(() => {
    if (!isOpen) return;
    const adults = Number(guests?.adults || 0);
    const children = Number(guests?.children || 0);
    const pax = adults + children;
    setFormData((prev) => ({
      ...prev,
      area: destination || prev.area || "",
      adultCount: adults,
      childrenCount: children,
      pax,
      guestCount: pax,
      roomCount: Number(guests?.rooms || prev.roomCount || 1),
      checkInDate: formatDateForInput(startDate) || prev.checkInDate || "",
      checkOutDate: formatDateForInput(endDate) || prev.checkOutDate || "",
    }));
  }, [destination, endDate, guests?.adults, guests?.children, guests?.rooms, isOpen, startDate]);

  // Steps Configuration (Increased to 4)
  const steps = [
    { id: 1, title: "Your Details", icon: User },
    { id: 2, title: "Stay Details", icon: Calendar },
    { id: 3, title: "Add-ons", icon: PlusCircle }, // New Step
    { id: 4, title: "Review Inquiry", icon: CheckCircle2 },
  ];

  if (!resort || !isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "adultCount" || name === "childrenCount") {
        const adults = Number(name === "adultCount" ? value : next.adultCount || 0);
        const children = Number(name === "childrenCount" ? value : next.childrenCount || 0);
        next.pax = adults + children;
        next.guestCount = adults + children;
      }
      if (name === "guestCount") {
        next.pax = Number(value || 0);
      }
      return next;
    });
  };

  // Toggle service selection
  const toggleService = (serviceName) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceName)
        ? prev.selectedServices.filter(s => s !== serviceName)
        : [...prev.selectedServices, serviceName]
    }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  const handleClose = () => {
    setStep(1);
    setAgreed(false);
    onClose();
  };

  const handleSubmit = () => {
    onSubmitInquiry(formData);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-8 pb-0 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <img src={resort.profileImage} alt="" className="w-12 h-12 rounded-2xl object-cover shadow-md" />
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{resort.name}</h2>
              <p className="text-slate-500 font-medium text-xs tracking-wide">
                STEP {step} OF 4: {steps[step-1]?.title}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-8 mt-6">
          <div className="flex gap-2 h-1.5 w-full bg-slate-100 rounded-full">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`flex-1 transition-all duration-500 rounded-full ${step >= i ? 'bg-blue-600' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Full Name</label>
                <input name="guestName" value={formData.guestName ?? ""} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Email</label>
                  <input name="email" value={formData.email ?? ""} onChange={handleChange} type="email" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Contact Number</label>
                  <input name="contactNumber" value={formData.contactNumber ?? ""} onChange={handleChange} type="tel" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="+(63) 917 180 2394" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              
              {/* Row 1: 2 Columns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Check-in Date</label>
                  <input name="checkInDate" value={formData.checkInDate ?? ""} onChange={handleChange} type="date" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Check-out Date</label>
                  <input name="checkOutDate" value={formData.checkOutDate ?? ""} onChange={handleChange} type="date" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {/* Row 2: 2 Columns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Time In</label>
                  <input name="checkInTime" value={formData.checkInTime ?? ""} onChange={handleChange} type="time" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Time Out</label>
                  <input name="checkOutTime" value={formData.checkOutTime ?? ""} onChange={handleChange} type="time" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {/* Row 3: 3 Columns */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Adults</label>
                  <input name="adultCount" value={formData.adultCount ?? 0} onChange={handleChange} type="number" min="0" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Children</label>
                  <input name="childrenCount" value={formData.childrenCount ?? 0} onChange={handleChange} type="number" min="0" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Total Pax</label>
                  <input
                    name="guestCount"
                    value={formData.guestCount ?? 0}
                    type="number"
                    min="0"
                    readOnly
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-500 border-none outline-none cursor-not-allowed"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Row 4: 2 Columns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Sleeping Guests</label>
                  <input name="sleepingGuests" value={formData.sleepingGuests ?? 0} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Number of Rooms</label>
                  <input name="roomCount" value={formData.roomCount ?? 1} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
              </div>

            </div>
          )}
          {/* NEW STEP 3: Extra Services */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex flex-col gap-3">
                <p className="text-sm text-slate-500 mb-2">Select additional services you might need:</p>
                {resort.extraServices && resort.extraServices.length > 0 ? (
                  resort.extraServices.map((service, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleService(service.name)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        formData.selectedServices.includes(service.name)
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-100 bg-white hover:border-slate-200"
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className={`font-bold text-sm ${formData.selectedServices.includes(service.name) ? "text-blue-700" : "text-slate-700"}`}>
                          {service.name}
                        </span>
                        {service.price && <span className="text-xs text-slate-400">₱{service.price}</span>}
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                        formData.selectedServices.includes(service.name) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-300"
                      }`}>
                        <Check size={14} strokeWidth={4} />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 text-sm italic">No extra services available for this resort.</p>
                  </div>
                )}
              </div>
              <div className="space-y-1 mt-4">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Message section</label>
                <textarea name="message" value={formData.message ?? ""} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" placeholder="Anything else we should know?" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in zoom-in-95 space-y-6">
              <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
                <h4 className="text-blue-600 font-black uppercase text-[10px] tracking-widest mb-4 text-center">Inquiry Summary</h4>
                <div className="grid grid-cols-2 gap-y-6">
                  <SummaryItem icon={User} label="Guest" value={formData.guestName || "Not set"} />
                  <SummaryItem icon={MapPin} label="Pax" value={`${formData.pax} People`} />
                  <SummaryItem icon={Calendar} label="Dates" value={`${formData.checkInDate} to ${formData.checkOutDate}`} />
                  <SummaryItem icon={Clock} label="Schedule" value={`${formatTime(formData.checkInTime)} - ${formatTime(formData.checkOutTime)}`} />
                  <SummaryItem icon={Phone} label="Contact" value={formData.contactNumber || "Not set"} />
                  <SummaryItem 
                    icon={PlusCircle} 
                    label="Add-ons" 
                    value={formData.selectedServices.length > 0 ? formData.selectedServices.join(", ") : "None"} 
                  />
                </div>
              </div>

              {/* Terms and Conditions Section */}
              <div className="px-2 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="relative flex items-center pt-1">
                    <input 
                      type="checkbox" 
                      id="terms"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-5 h-5 rounded-md border-2 border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                  <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
                    I have read and agree to the resort&apos;s{" "}
                    <button type="button" className="text-blue-600 font-bold underline hover:text-blue-700">Rules and Regulations</button>
                    {" "}and{" "}
                    <button type="button" className="text-blue-600 font-bold underline hover:text-blue-700">Terms and Conditions</button>.
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 pt-0 flex gap-3">
          {step > 1 && (
            <Button variant="ghost" onClick={prevStep} className="flex items-center justify-center flex-1 h-12 rounded-2xl font-bold text-slate-500">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          <Button 
            onClick={step === 4 ? handleSubmit : nextStep}
            disabled={step === 4 && !agreed} // Disable if on last step and not agreed
            className={`flex items-center justify-center flex-1 h-12 rounded-2xl font-bold shadow-lg transition-all 
              ${step === 4 
                ? (agreed ? "bg-green-600 hover:bg-green-700" : "bg-slate-300 cursor-not-allowed") 
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {step === 4 ? "Send Inquiry" : "Continue"} 
            {step < 4 && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm border border-blue-100">
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">{label}</p>
        <p className="text-sm font-bold text-slate-700 mt-1 truncate md:whitespace-normal">{value}</p>
      </div>
    </div>
  );
}
