"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Calendar, User, CheckCircle2, ArrowRight, ArrowLeft, Phone, MapPin, Clock, PlusCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const buildInitialFormData = ({
  destination = "",
  guests = { adults: 0, children: 0 },
  startDate = "",
  endDate = "",
  checkInTime = "14:00",
  checkOutTime = "12:00",
  initialSelectedRoomIds = [],
  initialSelectedRoomNames = [],
}) => ({
  inquirerType: "client",
  agentName: "",
  guestName: "",
  stayingGuestName: "",
  stayingGuestEmail: "",
  stayingGuestPhone: "",
  email: "",
  phoneNumber: "",
  area: destination || "",
  address: "",
  adultCount: Number(guests?.adults || 0),
  childrenCount: Number(guests?.children || 0),
  pax: Number((guests?.adults || 0) + (guests?.children || 0)),
  guestCount: Number((guests?.adults || 0) + (guests?.children || 0)),
  sleepingGuests: 0,
  roomCount: initialSelectedRoomIds.length,
  roomName: initialSelectedRoomNames.join(", "),
  roomId: initialSelectedRoomIds[0] || "",
  selectedRoomIds: initialSelectedRoomIds,
  selectedRoomNames: initialSelectedRoomNames,
  checkInDate: startDate,
  checkOutDate: endDate,
  checkInTime: checkInTime || "14:00",
  checkOutTime: checkOutTime || "12:00",
  message: "",
  selectedServices: [],
});

export default function BookingCreationTemplate({
  isOpen,
  onClose,
  resort,
  unavailableRoomIds = [],
  initialSelectedRoomIds = [],
  destination,
  guests,
  startDate,
  endDate,
  checkInTime,
  checkOutTime,
  enableDraftPersistence = false,
  draftKey = "",
  showMessage = true,
  showTerms = true,
  showAddOns = true,
  showStatus = false,
  submitLabel = "Send Inquiry",
  isSubmitting = false,
  title,
  subtitle,
  headerImageUrl,
  onSubmit,
}) {
  const [agreed, setAgreed] = useState(false);
  const [legalView, setLegalView] = useState(null);
  const [step, setStep] = useState(1);
  const blockedIds = useMemo(
    () => new Set((unavailableRoomIds || []).map((id) => id?.toString()).filter(Boolean)),
    [unavailableRoomIds]
  );
  const availableRooms = useMemo(
    () => (resort?.rooms || []).filter((room) => !blockedIds.has(room?.id?.toString())),
    [blockedIds, resort?.rooms]
  );
  const initialSelectableRoomIds = useMemo(() => {
    const requested = (initialSelectedRoomIds || []).map((id) => id?.toString());
    const mapped = (availableRooms || [])
      .filter((room) => requested.includes(room?.id?.toString()))
      .map((room) => room.id);
    return mapped.length > 0
      ? mapped
      : availableRooms?.[0]?.id
        ? [availableRooms[0].id]
        : [];
  }, [availableRooms, initialSelectedRoomIds]);
  const initialSelectableRoomNames = useMemo(
    () => (availableRooms || []).filter((room) => initialSelectableRoomIds.includes(room.id)).map((room) => room.name),
    [availableRooms, initialSelectedRoomIds]
  );

  const formatDateForInput = (date) => {
    if (!date) return "";
    return date instanceof Date ? date.toISOString().split("T")[0] : date;
  };

  const formatTime = (time) => {
    if (!time) return "Not set";
    const [hours, minutes] = time.split(":");
    const h = hours % 12 || 12;
    const ampm = hours >= 12 ? "PM" : "AM";
    return `${h}:${minutes} ${ampm}`;
  };

  const [formData, setFormData] = useState(() =>
    buildInitialFormData({
      destination,
      guests,
      startDate: formatDateForInput(startDate),
      endDate: formatDateForInput(endDate),
      checkInTime,
      checkOutTime,
      initialSelectedRoomIds: initialSelectableRoomIds,
      initialSelectedRoomNames: initialSelectableRoomNames,
    })
  );

  useEffect(() => {
    if (!isOpen || !resort?.id) return;
    const base = buildInitialFormData({
      destination,
      guests,
      startDate: formatDateForInput(startDate),
      endDate: formatDateForInput(endDate),
      checkInTime,
      checkOutTime,
      initialSelectedRoomIds: initialSelectableRoomIds,
      initialSelectedRoomNames: initialSelectableRoomNames,
    });
    setStep(1);
    setAgreed(false);
    setLegalView(null);
    if (!enableDraftPersistence || typeof window === "undefined" || !draftKey) {
      setFormData(base);
      return;
    }
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (!raw) {
        setFormData(base);
        return;
      }
      const saved = JSON.parse(raw);
        setFormData({
          ...base,
          inquirerType: saved.inquirerType || base.inquirerType,
          agentName: saved.agentName || "",
          guestName: saved.guestName || "",
          stayingGuestName: saved.stayingGuestName || "",
          stayingGuestEmail: saved.stayingGuestEmail || "",
          stayingGuestPhone: saved.stayingGuestPhone || "",
          email: saved.email || "",
          phoneNumber: saved.phoneNumber || "",
        area: saved.area || base.area,
        address: saved.address || "",
        message: saved.message || "",
        sleepingGuests: Number(saved.sleepingGuests || 0),
      });
    } catch {
      setFormData(base);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, resort?.id, destination, guests?.adults, guests?.children, startDate, endDate, checkInTime, checkOutTime, initialSelectableRoomIds.join("|"), initialSelectableRoomNames.join("|"), enableDraftPersistence, draftKey]);

  useEffect(() => {
    if (!enableDraftPersistence || !isOpen || !resort?.id || typeof window === "undefined" || !draftKey) return;
    const timer = setTimeout(() => {
      sessionStorage.setItem(
        draftKey,
        JSON.stringify({
          inquirerType: formData.inquirerType || "client",
          agentName: formData.agentName || "",
          guestName: formData.guestName || "",
          stayingGuestName: formData.stayingGuestName || "",
          stayingGuestEmail: formData.stayingGuestEmail || "",
          stayingGuestPhone: formData.stayingGuestPhone || "",
          email: formData.email || "",
          phoneNumber: formData.phoneNumber || "",
          area: formData.area || "",
          address: formData.address || "",
          message: formData.message || "",
          sleepingGuests: Number(formData.sleepingGuests || 0),
        })
      );
    }, 150);
    return () => clearTimeout(timer);
  }, [formData, isOpen, resort?.id, enableDraftPersistence, draftKey]);

  const steps = [
    { id: 1, title: "Inquirer Details", icon: User },
    { id: 2, title: "Guest Details", icon: User },
    { id: 3, title: "Stay Details", icon: Calendar },
    { id: 4, title: "Add-ons", icon: PlusCircle },
    { id: 5, title: "Review Inquiry", icon: CheckCircle2 },
  ];

  const selectedRoomNamesDerived = (availableRooms || [])
    .filter((room) => (formData.selectedRoomIds || []).includes(room.id))
    .map((room) => room.name);

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

  const autoGuestNameRef = useRef("");
  useEffect(() => {
    if (formData.inquirerType !== "client") return;
    const shouldSync =
      !formData.stayingGuestName ||
      formData.stayingGuestName === autoGuestNameRef.current;
    if (!shouldSync) return;
    const nextName = formData.guestName || "";
    if (formData.stayingGuestName === nextName) {
      autoGuestNameRef.current = nextName;
      return;
    }
    autoGuestNameRef.current = nextName;
    setFormData((prev) => ({ ...prev, stayingGuestName: nextName }));
  }, [formData.guestName, formData.inquirerType, formData.stayingGuestName]);

  const autoGuestEmailRef = useRef("");
  useEffect(() => {
    if (formData.inquirerType !== "client") return;
    const shouldSync =
      !formData.stayingGuestEmail ||
      formData.stayingGuestEmail === autoGuestEmailRef.current;
    if (!shouldSync) return;
    const nextEmail = formData.email || "";
    if (formData.stayingGuestEmail === nextEmail) {
      autoGuestEmailRef.current = nextEmail;
      return;
    }
    autoGuestEmailRef.current = nextEmail;
    setFormData((prev) => ({ ...prev, stayingGuestEmail: nextEmail }));
  }, [formData.email, formData.inquirerType, formData.stayingGuestEmail]);

  const autoGuestPhoneRef = useRef("");
  useEffect(() => {
    if (formData.inquirerType !== "client") return;
    const shouldSync =
      !formData.stayingGuestPhone ||
      formData.stayingGuestPhone === autoGuestPhoneRef.current;
    if (!shouldSync) return;
    const nextPhone = formData.phoneNumber || "";
    if (formData.stayingGuestPhone === nextPhone) {
      autoGuestPhoneRef.current = nextPhone;
      return;
    }
    autoGuestPhoneRef.current = nextPhone;
    setFormData((prev) => ({ ...prev, stayingGuestPhone: nextPhone }));
  }, [formData.phoneNumber, formData.inquirerType, formData.stayingGuestPhone]);

  useEffect(() => {
    if (formData.inquirerType !== "agent") return;
    const nextName = formData.agentName || "";
    if (formData.guestName === nextName) return;
    setFormData((prev) => ({ ...prev, guestName: nextName }));
  }, [formData.agentName, formData.guestName, formData.inquirerType]);

  const toggleService = (serviceName) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceName)
        ? prev.selectedServices.filter((s) => s !== serviceName)
        : [...prev.selectedServices, serviceName],
    }));
  };

  const toggleRoomSelection = (room) => {
    setFormData((prev) => {
      const alreadySelected = prev.selectedRoomIds.includes(room.id);
      const selectedRoomIds = alreadySelected
        ? prev.selectedRoomIds.filter((id) => id !== room.id)
        : [...prev.selectedRoomIds, room.id];
      const selectedRoomNames = (availableRooms || [])
        .filter((item) => selectedRoomIds.includes(item.id))
        .map((item) => item.name);

      return {
        ...prev,
        selectedRoomIds,
        selectedRoomNames,
        roomCount: selectedRoomIds.length,
        roomId: selectedRoomIds[0] || "",
        roomName: selectedRoomNames.join(", "),
      };
    });
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  const handleClose = () => {
    setStep(1);
    setAgreed(false);
    setLegalView(null);
    onClose?.();
  };

  const handleSubmit = () => {
    const selectedRoomIds = (formData.selectedRoomIds || []).filter(
      (id) => !blockedIds.has(id?.toString())
    );
    const selectedRoomNames = (availableRooms || [])
      .filter((room) => selectedRoomIds.includes(room.id))
      .map((room) => room.name);
    const clientNormalized =
      formData.inquirerType === "client"
        ? {
            ...formData,
            stayingGuestName: formData.guestName || "",
            stayingGuestEmail: formData.email || "",
            stayingGuestPhone: formData.phoneNumber || "",
          }
        : {
            ...formData,
          };
    const normalized =
      selectedRoomIds.length > 0
        ? {
            ...clientNormalized,
            selectedRoomIds,
            selectedRoomNames,
            roomCount: selectedRoomIds.length,
            roomId: selectedRoomIds[0] || "",
            roomName: selectedRoomNames.join(", "),
          }
        : clientNormalized;

    onSubmit?.(normalized);

    if (enableDraftPersistence && typeof window !== "undefined" && draftKey) {
      sessionStorage.removeItem(draftKey);
    }

    handleClose();
  };

  if (!resort || !isOpen) return null;

  const headerTitle = title || resort?.name || "Booking";
  const headerSubtitle = subtitle || `STEP ${step} OF 5: ${steps[step - 1]?.title}`;
  const rulesText = resort?.rulesAndRegulations || resort?.rules_and_regulations || "";
  const termsText = resort?.termsAndConditions || resort?.terms_and_conditions || "";
  const legalTitle = legalView === "rules" ? "Rules and Regulations" : "Terms and Conditions";
  const legalBody = legalView === "rules" ? rulesText : termsText;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 pb-0 flex justify-between items-start">
          <div className="flex items-center gap-4">
            {headerImageUrl ? (
              <img src={headerImageUrl} alt="" className="w-12 h-12 rounded-2xl object-cover shadow-md" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                <User size={20} />
              </div>
            )}
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{headerTitle}</h2>
              <p className="text-slate-500 font-medium text-xs tracking-wide">{headerSubtitle}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="px-8 mt-6">
          <div className="flex gap-2 h-1.5 w-full bg-slate-100 rounded-full">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`flex-1 transition-all duration-500 rounded-full ${step >= i ? "bg-blue-600" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Inquirer Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { id: "client", label: "Client", description: "I am booking for myself or my group." },
                    { id: "agent", label: "Agent", description: "I am inquiring on someone else's behalf." },
                  ].map((option) => {
                    const isSelected = formData.inquirerType === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, inquirerType: option.id }))}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                          isSelected
                            ? "border-blue-600 bg-blue-50"
                            : "border-slate-100 bg-white hover:border-slate-200"
                        }`}
                      >
                        <div className="flex flex-col items-start">
                          <span className={`font-bold text-sm ${isSelected ? "text-blue-700" : "text-slate-700"}`}>
                            {option.label}
                          </span>
                          <span className="text-xs text-slate-400">{option.description}</span>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-300"
                        }`}>
                          <Check size={14} strokeWidth={4} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.inquirerType === "agent" && (
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Agent Name</label>
                  <input
                    name="agentName"
                    value={formData.agentName ?? ""}
                    onChange={handleChange}
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Agent full name"
                  />
                </div>
              )}
              {formData.inquirerType === "client" && (
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Contact Name</label>
                  <input
                    name="guestName"
                    value={formData.guestName ?? ""}
                    onChange={handleChange}
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full name"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Email</label>
                  <input name="email" value={formData.email ?? ""} onChange={handleChange} type="email" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Phone</label>
                  <input name="phoneNumber" value={formData.phoneNumber ?? ""} onChange={handleChange} type="tel" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="+(63) 917 180 2394" />
                </div>
              </div>
              {formData.inquirerType === "client" ? (
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Address (optional)</label>
                  <input name="address" value={formData.address ?? ""} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="Street, city, province" />
                </div>
              ) : null}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              {formData.inquirerType !== "client" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Guest Name</label>
                    <input name="stayingGuestName" value={formData.stayingGuestName ?? ""} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="Guest full name" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Guest Email</label>
                    <input name="stayingGuestEmail" value={formData.stayingGuestEmail ?? ""} onChange={handleChange} type="email" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="guest@example.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Guest Contact Number</label>
                    <input name="stayingGuestPhone" value={formData.stayingGuestPhone ?? ""} onChange={handleChange} type="tel" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="+(63) 917 180 2394" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Guest Address (optional)</label>
                    <input name="address" value={formData.address ?? ""} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="Street, city, province" />
                  </div>
                </div>
              ) : null}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Sleeping Guests</label>
                  <input name="sleepingGuests" value={formData.sleepingGuests ?? 0} onChange={handleChange} type="number" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Selected Rooms</label>
                  <div className="w-full px-4 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm min-h-[48px]">
                    {selectedRoomNamesDerived.length > 0 ? selectedRoomNamesDerived.join(", ") : "No rooms selected"}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 ml-1">Choose Rooms (Multiple)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(availableRooms || []).map((room) => {
                    const isSelected = formData.selectedRoomIds.includes(room.id);
                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => toggleRoomSelection(room)}
                        className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <p className="font-bold text-sm">{room.name}</p>
                      </button>
                    );
                  })}
                </div>
                {(availableRooms || []).length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    No rooms are available for the selected date/time.
                  </p>
                ) : null}
              </div>
            </div>
          )}

          {step === 4 && showAddOns && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              {showStatus ? (
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Status</label>
                  <select
                    name="status"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.status || "Inquiry"}
                    onChange={handleChange}
                  >
                    {[
                      "Inquiry",
                      "Approved Inquiry",
                      "Pending Payment",
                      "Confirmed",
                      "Ongoing",
                      "Pending Checkout",
                    ].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div className="flex flex-col gap-3">
                <p className="text-sm text-slate-500 mb-2">Select additional services you might need:</p>
                {resort?.extraServices && resort.extraServices.length > 0 ? (
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
                        {service.price && <span className="text-xs text-slate-400">PHP {service.price}</span>}
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
              {showMessage ? (
                <div className="space-y-1 mt-4">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">Message section</label>
                  <textarea name="message" value={formData.message ?? ""} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" placeholder="Anything else we should know?" />
                </div>
              ) : null}
            </div>
          )}

          {step === 5 && (
            <div className="animate-in zoom-in-95 space-y-6">
              {legalView ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-blue-600 font-black uppercase text-[10px] tracking-widest">{legalTitle}</h4>
                    <button
                      type="button"
                      onClick={() => setLegalView(null)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-700"
                    >
                      Back to summary
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 whitespace-pre-wrap">
                    {legalBody ? legalBody : "No rules or terms provided by this resort yet."}
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
                    <h4 className="text-blue-600 font-black uppercase text-[10px] tracking-widest mb-4 text-center">Inquiry Summary</h4>
                    <div className="grid grid-cols-2 gap-y-6">
                      <SummaryItem icon={User} label="Inquirer" value={formData.inquirerType === "agent" ? "Agent" : "Client"} />
                      {formData.inquirerType === "agent" ? (
                        <SummaryItem icon={User} label="Agent Name" value={formData.agentName || "Not set"} />
                      ) : null}
                      <SummaryItem
                        icon={User}
                        label={formData.inquirerType === "agent" ? "Agent Name" : "Contact Name"}
                        value={formData.inquirerType === "agent" ? (formData.agentName || "Not set") : (formData.guestName || "Not set")}
                      />
                      <SummaryItem icon={User} label="Guest" value={formData.stayingGuestName || "Not set"} />
                      <SummaryItem icon={Phone} label="Guest Contact" value={formData.stayingGuestPhone || "Not set"} />
                      <SummaryItem icon={MapPin} label="Pax" value={`${formData.pax} People`} />
                      <SummaryItem icon={Calendar} label="Dates" value={`${formData.checkInDate} to ${formData.checkOutDate}`} />
                      <SummaryItem icon={Clock} label="Schedule" value={`${formatTime(formData.checkInTime)} - ${formatTime(formData.checkOutTime)}`} />
                      <SummaryItem icon={PlusCircle} label="Rooms" value={selectedRoomNamesDerived.length > 0 ? selectedRoomNamesDerived.join(", ") : "Not set"} />
                      <SummaryItem icon={Phone} label="Contact" value={formData.phoneNumber || "Not set"} />
                      <SummaryItem icon={MapPin} label="Address" value={formData.address || "Not set"} />
                      {showAddOns ? (
                        <SummaryItem icon={PlusCircle} label="Add-ons" value={formData.selectedServices.length > 0 ? formData.selectedServices.join(", ") : "None"} />
                      ) : null}
                    </div>
                  </div>

                  {showTerms ? (
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
                          <button
                            type="button"
                            onClick={() => setLegalView("rules")}
                            className="text-blue-600 font-bold underline hover:text-blue-700"
                          >
                            Rules and Regulations
                          </button>
                          {" "}and{" "}
                          <button
                            type="button"
                            onClick={() => setLegalView("terms")}
                            className="text-blue-600 font-bold underline hover:text-blue-700"
                          >
                            Terms and Conditions
                          </button>.
                        </label>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-8 pt-0 flex gap-3">
          {step > 1 && (
            <Button variant="ghost" onClick={prevStep} className="flex items-center justify-center flex-1 h-12 rounded-2xl font-bold text-slate-500">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          )}
          <Button
            onClick={step === 5 ? handleSubmit : nextStep}
            disabled={(step === 5 && showTerms && !agreed) || isSubmitting}
            className={`flex items-center justify-center flex-1 h-12 rounded-2xl font-bold shadow-lg transition-all ${
              step === 5
                ? (showTerms ? (agreed ? "bg-green-600 hover:bg-green-700" : "bg-slate-300 cursor-not-allowed") : "bg-green-600 hover:bg-green-700")
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {step === 5 ? submitLabel : "Continue"}
            {step < 5 && <ArrowRight className="ml-2 h-4 w-4" />}
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
