import { getPrisma } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const TIER_PRICES: Record<string, number> = { FREE: 0, GROWTH: 799, PRO: 1499, PLUS: 1999 };

export default async function AdminSubscriptionsPage() {
  await requireAdminUser("manageWorkshops");
  const prisma = getPrisma();

  const workshops = prisma
    ? await prisma.workshop.findMany({
        orderBy: { updatedAt: "desc" },
        take: 300,
        select: { id: true, name: true, city: true, subscriptionTier: true, status: true, subscription: true },
      })
    : [];

  const byTier = workshops.reduce<Record<string, number>>((acc, w) => {
    acc[w.subscriptionTier] = (acc[w.subscriptionTier] || 0) + 1;
    return acc;
  }, {});
  const mrr = workshops.reduce((sum, w) => sum + (TIER_PRICES[w.subscriptionTier] ?? 0), 0);
  const paying = workshops.filter((w) => w.subscriptionTier !== "FREE").length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ink px-6 py-8 text-white lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="mt-1 text-sm text-slate-300">Workshop subscription tiers and recurring revenue.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-6 py-8 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-center shadow-soft">
            <div className="text-3xl font-bold text-slate-900">R{mrr.toLocaleString("en-ZA")}</div>
            <div className="mt-1 text-xs text-slate-500">Estimated MRR</div>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-center shadow-soft">
            <div className="text-3xl font-bold text-slate-900">{paying}</div>
            <div className="mt-1 text-xs text-slate-500">Paying workshops</div>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 text-center shadow-soft">
            <div className="text-3xl font-bold text-slate-900">{workshops.length}</div>
            <div className="mt-1 text-xs text-slate-500">Total workshops</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {Object.entries(byTier).map(([tier, count]) => (
            <span key={tier} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-soft">
              {tier}: {count}
            </span>
          ))}
        </div>

        <div className="overflow-auto rounded-[2rem] border border-slate-200 bg-white shadow-soft">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead><tr className="border-b border-slate-200 text-slate-500">
              <th className="px-4 py-3">Workshop</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Tier</th><th className="px-4 py-3">Price/mo</th><th className="px-4 py-3">Renews</th><th className="px-4 py-3">Status</th>
            </tr></thead>
            <tbody>
              {workshops.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">No workshops found.</td></tr>}
              {workshops.map((w) => (
                <tr key={w.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-900">{w.name}</td>
                  <td className="px-4 py-3">{w.city}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">{w.subscriptionTier}</span></td>
                  <td className="px-4 py-3">R{(TIER_PRICES[w.subscriptionTier] ?? 0).toLocaleString("en-ZA")}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{w.subscription?.renewsAt ? w.subscription.renewsAt.toLocaleDateString("en-ZA") : "—"}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">{w.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
