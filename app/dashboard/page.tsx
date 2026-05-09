const cards = [
  { label: "New leads", value: "36", detail: "+18% vs last week" },
  { label: "Quote response rate", value: "82%", detail: "Based on accepted lead notifications" },
  { label: "Estimated revenue pipeline", value: "R48,200", detail: "Open quote value" },
  { label: "Avg response speed", value: "11 min", detail: "Faster than city median" }
];

const leadRows = [
  ["Brake pad replacement", "Johannesburg", "VW Polo", "New", "R180"],
  ["Major service", "Pretoria", "Toyota Hilux", "Quoted", "R220"],
  ["Aircon diagnostics", "Cape Town", "BMW 320d", "Won", "R250"],
  ["No-start callout", "Durban", "Ford Ranger", "New", "R160"]
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Workshop dashboard</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Know exactly what your spend is buying</h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-600">
          This sample dashboard shows the commercial side of the marketplace: leads, quote performance, pipeline value, and ranking signals that justify subscriptions and ads.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-4xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-3 text-sm text-emerald-700">{card.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-950">Recent leads</h2>
        <div className="mt-5 overflow-auto">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-3 py-3">Lead</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Vehicle</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Lead fee</th>
              </tr>
            </thead>
            <tbody>
              {leadRows.map((row) => (
                <tr key={row.join("-")} className="border-b border-slate-100">
                  {row.map((cell) => (
                    <td key={cell} className="px-3 py-4">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
