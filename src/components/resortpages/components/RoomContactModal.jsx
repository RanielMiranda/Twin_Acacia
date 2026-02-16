import { useState } from "react";
import ContactModal from "../../ui/modals/ContactModal";
import InquiryForm from "./InquiryForm";
import { Mails, Phone, Facebook } from "lucide-react";

export default function RoomContactModal({ isOpen, onClose, resort, room }) {
  if (!room || !resort || !isOpen) return null;

  // Form state lifted here
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [dates, setDates] = useState("");
  const [message, setMessage] = useState("");

const handleSubmit = () => {
  // Simple validation
  if (!name || !email || !dates || !message) {
    alert("Please fill in all fields before submitting.");
    return;
  }

  const payload = {
    resortName: resort.name,
    roomName: room.name,
    name,
    email,
    contactNumber,
    dates,
    message
  };

  console.log(payload);

  // Close modal after submit
  onClose();

  // Reset form
  setName("");
  setEmail("");
  setDates("");
  setMessage("");
  setContactNumber("");
};

  return (
    <ContactModal isOpen={isOpen} onClose={onClose}>
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        {resort.profileImage && (
          <img
            src={resort.profileImage}
            alt={resort.name}
            className="w-14 h-14 rounded-full object-cover"
          />
        )}
        <div className="text-center sm:text-left">
          <h2 className="text-lg font-bold">{resort.name}</h2>
        </div>
      </div>

      <hr className="mb-4" />

      {/* ================= ROOM INFO ================= */}
      <h3 className="text-xl font-semibold mb-1">{room.name}</h3>
      <p className="text-gray-500 mb-4">₱{room.price.toLocaleString()} / night</p>

      {/* ================= CONTACT INFO ================= */}
      <div className="mb-4 space-y-1">
        <h3 className="text-xl font-semibold">Resort Contact</h3>

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

      {/* ================= INQUIRY FORM ================= */}
      <InquiryForm
        room={room}
        resort={resort}
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        contactNumber = {contactNumber}
        setContactNumber = {setContactNumber}
        dates={dates}
        setDates={setDates}
        message={message}
        setMessage={setMessage}
      />

      {/* ================= SUBMIT BUTTON (Parent) ================= */}
      <button
        onClick={handleSubmit}
        className="mt-4 w-full bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700 transition hover:scale-105"
      >
        Send Inquiry
      </button>
    </ContactModal>
  );
}
