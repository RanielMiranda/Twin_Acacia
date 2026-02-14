import ContactModal from "../../ui/modals/ContactModal";
import InquiryForm from "./InquiryForm";
import { MapPin, Mails, Phone } from "lucide-react";

export default function RoomContactModal({
  isOpen,
  onClose,
  resort,
  room
}) {
  if (!room || !resort) return null;

  return (
    <ContactModal isOpen={isOpen} onClose={onClose}>
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-4 mb-4">

        {/* Resort profileImage */}
        {resort.profileImage && (
          <img
            src={resort.profileImage}
            alt={resort.name}
            className="w-14 h-14 rounded-full object-cover"
          />
        )}

        {/* Resort Name */}
        <div>
          <h2 className="text-lg font-bold">
            {resort.name}
          </h2>
        </div>
      </div>

      <hr className="mb-4" />

      {/* ================= ROOM INFO ================= */}
      <h3 className="text-xl font-semibold mb-1">
        {room.name}
      </h3>

      <p className="text-gray-500 mb-4">
        ₱{room.price.toLocaleString()} / night
      </p>

      {/* ================= CONTACT INFO ================= */}
      <div className="mb-4 space-y-1">
        <h1 className="text-xl font-semibold">
        Resort Contact
        </h1>        

        <div className="flex items-center gap-1 my-1 text-gray-800">
            <Mails size={16} />
            <span className = "px-2"> {resort.contactEmail} </span>
        </div>
        <div className="flex items-center gap-1 my-1 text-gray-800">
            <Phone size={16} />
            <span className = "px-2"> {resort.contactPhone} </span>
        </div>     

        <div className="flex items-center gap-1 my-1 text-gray-800">
            <Mails size={16} className = "mr-2" /> 
            {resort.contactEmail && (
            <a
                href={`mailto:${resort.contactEmail}`}
                className="text-blue-600 hover:underline"
            >
                {resort.contactEmail}
            </a>
            )}
        </div>
      </div>

      <hr className="my-4" />

      {/* ================= INQUIRY FORM ================= */}
      <InquiryForm room={room} resort={resort} />
    </ContactModal>
  );
}
