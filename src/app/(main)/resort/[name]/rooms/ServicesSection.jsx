export default function ServicesTable({ services, className = "max-w-6xl mx-auto px-4 my-4" }) {
  if (!services?.length) return null;

  return (
    <section id="extra-services" className={className}>
      <h2 className="text-2xl font-semibold mb-4">Extra Services</h2>

      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-12 bg-slate-50 text-sm font-semibold text-slate-600 px-6 py-4">
          <div className="col-span-3">Service</div>
          <div className="col-span-7">Description</div>
          <div className="col-span-2 text-right">Price</div>
        </div>

        {/* Rows */}
        {services.map((service, i) => (
          <div
            key={i}
            className="grid grid-cols-12 px-6 py-5 border-t border-slate-100 hover:bg-blue-50/40 transition"
          >
            <div className="col-span-3 font-semibold text-slate-900">
              {service.name}
            </div>

            <div className="col-span-7 text-slate-500 text-sm">
              {service.description}
            </div>

            <div className="col-span-2 text-right font-bold text-blue-600">
              ₱{service.cost?.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
