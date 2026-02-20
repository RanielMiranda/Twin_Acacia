import React, { useState, useEffect } from "react";
import InquiryForm from "./InquiryForm";
import { Mails, Phone, Facebook } from "lucide-react";
import { useFilters } from "../../useclient/ContextFilter";

export default function ContactOwnerModal({ isOpen, onClose, resort }) {
  const { guests, startDate, endDate } = useFilters(); // Get current filter states

  // Helper to format Date objects for input type="date"
  const formatDateForInput = (date) => {
    if (!date) return "";
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    guestName: "",
    email: "",
    contactNumber: "",
    area: "",
    pax: guests?.adults + guests?.children || "",
    checkInDate: formatDateForInput(startDate),
    checkOutDate: formatDateForInput(endDate),
    message: "",
  });

  // Update form if filters change while modal is open
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        pax: guests?.adults + guests?.children,
        checkInDate: formatDateForInput(startDate),
        checkOutDate: formatDateForInput(endDate),
      }));
    }
  }, [isOpen, guests, startDate, endDate]);

  if (!resort || !isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      resortName: resort.name,
      ...formData,
      rates: resort.price, // From resort object
      location: resort.location, // From resort object
      status: "Pending Inquiry",
    };

    console.log("Booking Payload:", payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500">✕</button>

        <div className="flex items-center gap-4 mb-4">
          <img src={resort.profileImage} alt="" className="w-14 h-14 rounded-full object-cover" />
          <div>
            <h2 className="text-xl font-bold">{resort.name}</h2>
            <p className="text-xs text-gray-500">{resort.location}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <InquiryForm formData={formData} handleChange={handleChange} />
          <button type="submit" className="mt-6 w-full bg-blue-600 text-white rounded-md p-3 font-bold hover:bg-blue-700 transition">
            Send Booking Inquiry
          </button>
        </form>
      </div>
    </div>
  );
}