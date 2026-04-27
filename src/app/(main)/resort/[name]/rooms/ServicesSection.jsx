import { getServiceBaseRate, getServiceUnitLabel, normalizeServicePricingType } from "@/lib/utils";

export default function ServicesTable({ services, className = "max-w-6xl mx-auto px-4 my-4" }) {
  if (!services?.length) return null;

  return (
    <section id="extra-services" className={className}>
      <h2 className="mb-4 text-2xl font-semibold">Extra Services</h2>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-12 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-600">
          <div className="col-span-3">Service</div>
          <div className="col-span-7">Description</div>
          <div className="col-span-2 text-right">Price</div>
        </div>

        {services.map((service, i) => (
          <div
            key={i}
            className="grid grid-cols-12 border-t border-slate-100 px-6 py-5 transition hover:bg-blue-50/40"
          >
            <div className="col-span-3 font-semibold text-slate-900">
              {service.name}
            </div>

            <div className="col-span-7 text-sm text-slate-500">
              {service.description}
            </div>

            <div className="col-span-2 text-right font-bold text-blue-600">
              PHP {getServiceBaseRate(service).toLocaleString()}
              {normalizeServicePricingType(service) === "hourly" ? (
                <span className="ml-1 text-xs font-bold text-slate-400">
                  {getServiceUnitLabel(service)}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
