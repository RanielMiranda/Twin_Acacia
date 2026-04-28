export function TicketLoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 mt-16 pb-20 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="h-8 w-56 rounded bg-slate-200" />
          <div className="h-3 w-44 rounded bg-slate-100" />
        </div>
        <div className="h-12 w-40 rounded-full bg-slate-100" />
      </div>

      <div className="p-8 md:p-10 border border-slate-100 rounded-[2.5rem] bg-white">
        <div className="h-3 w-40 rounded bg-slate-200 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-2 w-20 rounded bg-slate-100" />
              <div className="h-8 w-full rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 md:p-10 border border-slate-100 rounded-[2.5rem] bg-white">
        <div className="h-3 w-52 rounded bg-slate-200 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-12 w-full rounded-2xl bg-slate-100" />
            <div className="h-12 w-full rounded-2xl bg-slate-100" />
            <div className="h-28 w-full rounded-2xl bg-slate-100" />
          </div>
          <div className="lg:col-span-4 h-52 rounded-[2rem] bg-slate-900/90" />
        </div>
      </div>

      <div className="p-8 border border-slate-100 rounded-[2.5rem] bg-white">
        <div className="h-3 w-40 rounded bg-slate-200 mb-4" />
        <div className="h-40 w-full rounded-2xl bg-slate-100 mb-4" />
        <div className="h-12 w-full rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
