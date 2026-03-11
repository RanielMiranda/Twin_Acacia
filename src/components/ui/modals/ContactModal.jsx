export default function ContactFormModal({
  open,
  onClose,
  panelClass = "bg-gray-900 text-white",
  overlayClass = "bg-black/60 backdrop-blur-sm",
}) {
  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 ${overlayClass} flex justify-center items-center z-50`}
      onClick={onClose}
    >
      <div
        className={`${panelClass} rounded-xl w-full max-w-lg p-8 relative shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold mb-6">
          Send Us a Message
        </h2>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full bg-black/20 opacity-50 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <input
            type="email"
            placeholder="Your Email"
            className="w-full bg-black/20 opacity-50 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <textarea
            placeholder="Your Message"
            rows="4"
            className="w-full bg-black/20 opacity-50 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-600 text-white py-3 rounded-lg transition font-medium"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
