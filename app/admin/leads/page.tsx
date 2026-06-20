import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { requireAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  switch (status) {
    case "NEW": return "bg-sky-50 text-sky-700";
    case "QUALIFIED": return "bg-violet-50 text-violet-700";
    case "ASSIGNED": return "bg-amber-50 text-amber-700";
    case "CLOSED_WON": case "ACCEPTED": return "bg-emerald-50 text-emerald-700";
    case "CLOSED_LOST": case "DECLINED": return "bg-rose-50 text-rose-700";
    default: return "bg-slate-100 text-slate-700";
  }
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdminUser("manageLeads");
  const params = (await searchParams) ?? {};
  const q = (params.q ?? "").toLowerCase();
  const status = params.status ?? "ALL";
  const prisma = getPrisma();

  const leads = prisma
    ? await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 200, include: { assignments: true } })
    : [];

  const filtered = leads.filter((l) => {
    const statusMatch = status === "ALL" || l.status === status;
    const qMatch = !q || [l.fullName, l.email, l.phone, l.vehicleLabel, l.serviceNeeded, l.city ?? ""].join(" ").toLowerCase().includes(q);
    return statusMatch && qMatch;
  });

  const statuses = ["ALL", "NEW", "QUALIFIED", "ASSIGNED", "CLOSED_WON", "CLOSED_LOST"];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ink px-6 py-8 text-white lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Lead management</h1>
          <p className="mt-1 text-sm text-slate-300">Search, filter, and review incoming quote requests.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <form method="get" className="mb-6 flex flex-wrap items-end gap-3 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
          <label className="flex-1 text-sm font-medium text-slate-700">Search
            <input name="q" defaultValue={params.q} placeholder="Name, email, vehicle, service…" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fire" />
          </label>
          <label className="text-sm font-medium text-slate-700">Status
            <select name="status" defaultValue={status} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fire">
              {statuses.map((s) => <option key={s} value={s}>{s === "ALL" ? "All" : s}</option>)}
            </select>
          </label>
          <button type="submit" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">Apply</button>
          <Link href="/admin/leads" className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">Reset</Link>
        </form>

        <div className="mb-4 text-sm text-slate-500">{filtered.length} lead{filtered.length === 1 ? "" : "s"}</div>

        <div className="overflow-auto rounded-[2rem] border border-slate-200 bg-white shadow-soft">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead><tr className="border-b border-slate-200 text-slate-500">
              <th className="px-4 py-3">Customer</th><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Service</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Assigned</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No leads match.</td></tr>}
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 align-top">
                  <td className="px-4 py-3"><div className="font-semibold text-slate-900">{l.fullName}</div><div className="text-xs">{l.email}</div><div className="text-xs">{l.phone}</div></td>
                  <td className="px-4 py-3">{l.vehicleLabel}</td>
                  <td className="px-4 py-3">{l.serviceNeeded}</td>
                  <td className="px-4 py-3 text-xs">{[l.city, l.province].filter(Boolean).join(", ") || l.location}</td>
                  <td className="px-4 py-3">{l.assignments.length}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge(l.status)}`}>{l.status}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{l.createdAt.toLocaleDateString("en-ZA")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
