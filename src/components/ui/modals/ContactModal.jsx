import { useState } from "react";
import { useToast } from "@/components/ui/toast/ToastProvider";

export default function ContactFormModal({
  open,
  onClose,
  panelClass = "bg-gray-900 text-white",
  overlayClass = "bg-black/60 backdrop-blur-sm",
}) {
  if (!open) return null;
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.message.trim()) {
      toast?.({ message: "Message is required.", color: "red" });
      return;
    }
    setSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body?.error || "Failed to send message.");
      }
      toast?.({ message: "Message sent to admin.", color: "green" });
      setForm({ name: "", email: "", message: "" });
      onClose?.();
    } catch (error) {
      toast?.({ message: error.message || "Failed to send message.", color: "red" });
    } finally {
      setSending(false);
    }
  };

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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange("name")}
            className="w-full bg-black/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <input
            type="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange("email")}
            className="w-full bg-black/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <textarea
            placeholder="Your Message"
            rows="4"
            value={form.message}
            onChange={handleChange("message")}
            className="w-full bg-black/20 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

          <button
            type="submit"
            disabled={sending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
