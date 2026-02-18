import React, { useState } from "react";
import InquiryForm from "./InquiryForm";
import { Mails, Phone, Facebook } from "lucide-react";

export default function ContactOwnerModal({ isOpen, onClose, resort }) {
  if (!resort || !isOpen) return null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [dates, setDates] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !email) {
      alert("Please fill in your name and email before submitting.");
      return;
    }

    const payload = {
      resortName: resort.name,
      name,
      email,
      contactNumber,
      dates,
      message,
    };

    console.log(payload);

    onClose();

    // Reset form
    setName("");
    setEmail("");
    setContactNumber("");
    setDates("");
    setMessage("");
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl relative  max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          {resort.profileImage && (
            <img
              src={resort.profileImage}
              alt={resort.name}
              className="w-14 h-14 rounded-full object-cover"
            />
          )}
          <h2 className="text-xl font-bold">{resort.name}</h2>
        </div>

        <hr className="mb-4" />

        {/* Resort Contact Info */}
        <div className="mb-4 space-y-1">
          {resort.contactMedia && (
            <div className="flex items-center gap-2 text-gray-800">
              <Facebook size={16} />
              <a
                href={resort.contactMedia}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Facebook Page
              </a>
            </div>
          )}
          {resort.contactEmail && (
            <div className="flex items-center gap-2 text-gray-800">
              <Mails size={16} />
              <a
                href={`mailto:${resort.contactEmail}`}
                className="text-blue-600 hover:underline"
              >
                {resort.contactEmail}
              </a>
            </div>
          )}
          {resort.contactPhone && (
            <div className="flex items-center gap-2 text-gray-800">
              <Phone size={16} />
              <span>{resort.contactPhone}</span>
            </div>
          )}
        </div>

        <hr className="my-4" />

        {/* Inquiry Form */}
        <form onSubmit={handleSubmit}>
          <InquiryForm
            resort={resort}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            contactNumber={contactNumber}
            setContactNumber={setContactNumber}
            dates={dates}
            setDates={setDates}
            message={message}
            setMessage={setMessage}
          />

          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700 transition hover:scale-105"
          >
            Send Inquiry
          </button>
        </form>
      </div>
    </div>
  );
}
