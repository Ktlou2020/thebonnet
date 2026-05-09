import Link from "next/link";

export function HeroSearch() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white p-5 shadow-soft">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Vehicle / make / model
          <input defaultValue="VW Polo / Toyota Hilux / Ford Ranger" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-accent transition focus:ring-2" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Service or symptom
          <input defaultValue="Brakes, service, no-start, oil leak" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-accent transition focus:ring-2" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          City / suburb
          <input defaultValue="Johannesburg, Sandton, Durbanville" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-accent transition focus:ring-2" />
        </label>
        <div className="flex items-end">
          <Link href="/request-quote" className="w-full rounded-2xl bg-ink px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-bonnet">
            Match me now
          </Link>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-3 py-1">Upload photos</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Voice note issue descriptions</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">WhatsApp quote routing</span>
        <span className="rounded-full bg-slate-100 px-3 py-1">Dealer vs independent price check</span>
      </div>
    </div>
  );
}
