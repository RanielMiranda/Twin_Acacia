import { useState } from "react";

export default function InquiryForm({ room, resort }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dates, setDates] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    const payload = {
      resortName: resort.name,
      roomName: room.name,
      name,
      email,
      dates,
      message
    };

    console.log(payload);

    // Later:
    // fetch("/api/inquiry", { method: "POST", body: JSON.stringify(payload) })
  };

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
        placeholder="Email"
        className="w-full border rounded p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700"
      >
        Send Inquiry
      </button>
    </div>
  );
}
