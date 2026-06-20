import { getPrisma } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function Bar({ label, value, max, tone = "bg-fire" }: { label: string; value: number; max: number; tone?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  await requireAdminUser("viewAnalytics");
  const prisma = getPrisma();

  const [leads, workshops, quotes, reviews, profiles] = prisma
    ? await Promise.all([
        prisma.lead.findMany({ select: { serviceNeeded: true, city: true, status: true, createdAt: true } }),
        prisma.workshop.findMany({ select: { status: true, city: true } }),
        prisma.quote.aggregate({ _count: true, _sum: { totalCents: true } }),
        prisma.review.count(),
        prisma.profile.count(),
      ])
    : [[], [], { _count: 0, _sum: { totalCents: 0 } }, 0, 0];

  const serviceCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.serviceNeeded] = (acc[l.serviceNeeded] || 0) + 1;
    return acc;
  }, {});
  const cityCounts = leads.reduce<Record<string, number>>((acc, l) => {
    const k = l.city || "Unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const topServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxService = Math.max(1, ...topServices.map((s) => s[1]));
  const maxCity = Math.max(1, ...topCities.map((c) => c[1]));

  const cards = [
    { label: "Total leads", value: leads.length },
    { label: "Workshops", value: workshops.length },
    { label: "Quotes submitted", value: quotes._count },
    { label: "Pipeline value", value: `R${Math.round((quotes._sum.totalCents ?? 0) / 100).toLocaleString("en-ZA")}` },
    { label: "Reviews", value: reviews },
    { label: "Registered users", value: profiles },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ink px-6 py-8 text-white lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Platform analytics</h1>
          <p className="mt-1 text-sm text-slate-300">Demand, supply, and conversion across the marketplace.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-6 py-8 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {cards.map((c) => (
            <div key={c.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-center shadow-soft">
              <div className="text-2xl font-bold text-slate-900">{c.value}</div>
              <div className="mt-1 text-xs text-slate-500">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="mb-5 text-base font-semibold text-slate-900">Top demand services</h2>
            <div className="space-y-4">
              {topServices.length ? topServices.map(([s, v]) => <Bar key={s} label={s} value={v} max={maxService} />) : <p className="text-sm text-slate-500">No data yet.</p>}
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="mb-5 text-base font-semibold text-slate-900">Top demand cities</h2>
            <div className="space-y-4">
              {topCities.length ? topCities.map(([c, v]) => <Bar key={c} label={c} value={v} max={maxCity} tone="bg-accent" />) : <p className="text-sm text-slate-500">No data yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
