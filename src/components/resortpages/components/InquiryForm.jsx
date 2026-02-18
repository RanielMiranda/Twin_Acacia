import React from "react";

export default function InquiryForm({
  resort,
  name,
  setName,
  email,
  setEmail,
  contactNumber,
  setContactNumber,
  dates,
  message,
  setMessage,
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Send Inquiry</h3>

      <input
        placeholder="Your Name"
        className="w-full border rounded p-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Your Email"
        className="w-full border rounded p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Your Contact Number"
        className="w-full border rounded p-2"
        value={contactNumber}
        onChange={(e) => setContactNumber(e.target.value)}
      />

      <input
        placeholder="Preferred Dates"
        className="w-full border rounded p-2"
        value={dates}
        onChange={(e) => setDates(e.target.value)}
      />

      <textarea
        placeholder="Message (optional)"
        className="w-full border rounded p-2"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
    </div>
  );
}
