export default function MechanicsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      {/* Filter bar skeleton */}
      <div className="mb-8 h-40 animate-pulse rounded-[2rem] bg-slate-100" />

      <div className="mb-6 h-8 w-48 animate-pulse rounded-full bg-slate-100" />

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-[2rem] border border-slate-100 bg-white p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="h-5 w-3/4 rounded-full bg-slate-100" />
                <div className="h-4 w-1/2 rounded-full bg-slate-100" />
                <div className="h-4 w-2/3 rounded-full bg-slate-100" />
              </div>
              <div className="h-12 w-12 rounded-2xl bg-slate-100" />
            </div>
            <div className="mt-4 flex gap-2">
              <div className="h-6 w-20 rounded-full bg-slate-100" />
              <div className="h-6 w-16 rounded-full bg-slate-100" />
            </div>
            <div className="mt-4 h-10 w-full rounded-full bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
