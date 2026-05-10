import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const leadStatuses = ["NEW", "QUALIFIED", "ASSIGNED", "CLOSED_WON", "CLOSED_LOST", "SPAM"] as const;
const workshopStatuses = ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"] as const;
const accreditationStatuses = ["PENDING", "VERIFIED", "REJECTED"] as const;
const subscriptionTiers = ["FREE", "GROWTH", "PRO"] as const;

function formatCurrencyFromCents(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0
  }).format((value || 0) / 100);
}

function formatTimestamp(value?: Date | null) {
  if (!value) return "—";
  return value.toLocaleString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function updateLeadStatus(formData: FormData) {
  "use server";

  await requireAdminSession();
  const prisma = getPrisma();
  if (!prisma) return;

  const leadId = String(formData.get("leadId") || "");
  const status = String(formData.get("status") || "");

  if (!leadId || !leadStatuses.includes(status as (typeof leadStatuses)[number])) return;

  await prisma.lead.update({
    where: { id: leadId },
    data: { status: status as (typeof leadStatuses)[number] }
  });

  revalidatePath("/admin");
}

async function updateWorkshop(formData: FormData) {
  "use server";

  await requireAdminSession();
  const prisma = getPrisma();
  if (!prisma) return;

  const workshopId = String(formData.get("workshopId") || "");
  const status = String(formData.get("status") || "");
  const featured = String(formData.get("featured") || "false") === "true";
  const subscriptionTier = String(formData.get("subscriptionTier") || "FREE");

  if (!workshopId) return;
  if (!workshopStatuses.includes(status as (typeof workshopStatuses)[number])) return;
  if (!subscriptionTiers.includes(subscriptionTier as (typeof subscriptionTiers)[number])) return;

  await prisma.workshop.update({
    where: { id: workshopId },
    data: {
      status: status as (typeof workshopStatuses)[number],
      featured,
      subscriptionTier: subscriptionTier as (typeof subscriptionTiers)[number]
    }
  });

  revalidatePath("/admin");
}

async function updateAccreditation(formData: FormData) {
  "use server";

  await requireAdminSession();
  const prisma = getPrisma();
  if (!prisma) return;

  const accreditationId = String(formData.get("accreditationId") || "");
  const status = String(formData.get("status") || "");

  if (!accreditationId || !accreditationStatuses.includes(status as (typeof accreditationStatuses)[number])) return;

  await prisma.accreditation.update({
    where: { id: accreditationId },
    data: {
      status: status as (typeof accreditationStatuses)[number],
      verifiedAt: status === "VERIFIED" ? new Date() : null
    }
  });

  revalidatePath("/admin");
}

export default async function AdminPage() {
  const session = await requireAdminSession();
  const prisma = getPrisma();

  const data = prisma
    ? await Promise.all([
        prisma.lead.count(),
        prisma.lead.count({ where: { status: "NEW" } }),
        prisma.lead.count({ where: { status: { in: ["QUALIFIED", "ASSIGNED"] } } }),
        prisma.workshop.count(),
        prisma.workshop.count({ where: { status: "PENDING" } }),
        prisma.workshop.count({ where: { featured: true } }),
        prisma.quote.count(),
        prisma.quote.aggregate({ _sum: { totalCents: true } }),
        prisma.accreditation.count({ where: { status: "PENDING" } }),
        prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
        prisma.workshop.findMany({
          include: {
            services: { include: { category: true } },
            owner: true,
            subscription: true
          },
          orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
          take: 100
        }),
        prisma.leadAssignment.findMany({
          include: {
            lead: true,
            workshop: true,
            quote: true
          },
          orderBy: { assignedAt: "desc" },
          take: 50
        }),
        prisma.accreditation.findMany({
          include: { workshop: true },
          orderBy: [{ status: "asc" }, { createdAt: "desc" }],
          take: 50
        })
      ])
    : null;

  const [
    leadCount,
    newLeadCount,
    activeLeadCount,
    workshopCount,
    pendingWorkshopCount,
    featuredCount,
    quoteCount,
    quoteAggregate,
    pendingAccreditationCount,
    leads,
    workshops,
    assignments,
    accreditations
  ] = data || [0, 0, 0, 0, 0, 0, 0, { _sum: { totalCents: 0 } }, 0, [], [], [], []];

  const cards = [
    {
      label: "Submitted quote requests",
      value: String(leadCount),
      detail: "All customer quote requests captured in the platform so far."
    },
    {
      label: "Open request queue",
      value: String(newLeadCount + activeLeadCount),
      detail: "Requests still being qualified, routed, or waiting for workshop action."
    },
    {
      label: "Live and pending listings",
      value: String(workshopCount),
      detail: `${pendingWorkshopCount} listing${pendingWorkshopCount === 1 ? "" : "s"} still need approval or review.`
    },
    {
      label: "Quoted value in pipeline",
      value: formatCurrencyFromCents(quoteAggregate._sum.totalCents),
      detail: `${quoteCount} quote${quoteCount === 1 ? "" : "s"} stored across the assignment workflow.`
    },
    {
      label: "Featured listings",
      value: String(featuredCount),
      detail: "Workshops promoted on the customer-facing experience."
    },
    {
      label: "Accreditation checks",
      value: String(pendingAccreditationCount),
      detail: "Workshop trust items waiting for a super admin decision."
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Super admin</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Manage leads, listings, quotes, and marketplace trust</h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
            This private console gives you one place to review customer requests, route workshop operations, manage listing visibility,
            and protect the quality of The Bonnet marketplace.
          </p>
        </div>
        <form action="/api/admin/logout" method="post">
          <button type="submit" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
            Sign out {session.email}
          </button>
        </form>
      </div>

      {!prisma ? (
        <div className="mt-8 rounded-[2rem] bg-amber-50 px-5 py-4 text-sm text-amber-900">
          The database is not connected in this environment yet. Connect Railway PostgreSQL to manage live requests, quotes, listings, and accreditations.
        </div>
      ) : null}

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => (
          <div key={item.label} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-4xl font-semibold text-slate-950">{item.value}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Quote request inbox</h2>
              <p className="mt-2 text-sm text-slate-600">Review incoming quote requests, classify urgency, and keep the pipeline moving.</p>
            </div>
          </div>
          <div className="mt-6 overflow-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Vehicle</th>
                  <th className="px-3 py-3">Location</th>
                  <th className="px-3 py-3">Service</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {leads.length ? (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-slate-100 align-top">
                      <td className="px-3 py-4">
                        <div className="font-semibold text-slate-900">{lead.fullName}</div>
                        <div>{lead.email}</div>
                        <div>{lead.phone}</div>
                      </td>
                      <td className="px-3 py-4">{lead.vehicleLabel}</td>
                      <td className="px-3 py-4">
                        <div>{lead.location}</div>
                        {(lead.city || lead.province) ? <div className="text-xs text-slate-500">{[lead.city, lead.province].filter(Boolean).join(", ")}</div> : null}
                      </td>
                      <td className="px-3 py-4">
                        <div className="font-medium text-slate-900">{lead.serviceNeeded}</div>
                        {lead.urgency ? <div className="text-xs text-slate-500">Urgency: {lead.urgency}</div> : null}
                        {lead.details ? <div className="mt-1 max-w-xs text-xs text-slate-500">{lead.details}</div> : null}
                      </td>
                      <td className="px-3 py-4">
                        <form action={updateLeadStatus} className="flex flex-col gap-2">
                          <input type="hidden" name="leadId" value={lead.id} />
                          <select name="status" defaultValue={lead.status} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                            {leadStatuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <button type="submit" className="rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white">Update</button>
                        </form>
                      </td>
                      <td className="px-3 py-4 text-xs text-slate-500">{formatTimestamp(lead.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-3 py-8 text-center text-sm text-slate-500" colSpan={6}>No quote requests have been submitted yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-950">Routing and quote activity</h2>
          <p className="mt-2 text-sm text-slate-600">Track assignment flow and quote responses without leaving the admin console.</p>
          <div className="mt-6 space-y-4">
            {assignments.length ? (
              assignments.map((assignment) => (
                <div key={assignment.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{assignment.workshop.name}</div>
                      <div className="text-xs text-slate-500">Assigned {formatTimestamp(assignment.assignedAt)}</div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{assignment.status}</span>
                  </div>
                  <div className="mt-3 text-sm text-slate-600">
                    <div><span className="font-medium text-slate-900">Lead:</span> {assignment.lead.fullName} — {assignment.lead.serviceNeeded}</div>
                    <div><span className="font-medium text-slate-900">Vehicle:</span> {assignment.lead.vehicleLabel}</div>
                    {assignment.leadPriceCents ? <div><span className="font-medium text-slate-900">Lead fee:</span> {formatCurrencyFromCents(assignment.leadPriceCents)}</div> : null}
                    {assignment.quote ? (
                      <div className="mt-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        Quote {assignment.quote.status} · Total {formatCurrencyFromCents(assignment.quote.totalCents)}
                        {assignment.quote.etaText ? ` · ETA ${assignment.quote.etaText}` : ""}
                      </div>
                    ) : (
                      <div className="mt-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-800">No quote submitted yet.</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                No lead assignments or quote activity yet.
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Listing control centre</h2>
            <p className="mt-2 text-sm text-slate-600">
              Approve workshops, change featured placement, and manage subscription tier visibility from one table.
            </p>
          </div>
        </div>
        <div className="mt-6 overflow-auto">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-3 py-3">Workshop</th>
                <th className="px-3 py-3">Owner / contact</th>
                <th className="px-3 py-3">Services</th>
                <th className="px-3 py-3">Performance</th>
                <th className="px-3 py-3">Controls</th>
                <th className="px-3 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {workshops.length ? (
                workshops.map((workshop) => (
                  <tr key={workshop.id} className="border-b border-slate-100 align-top">
                    <td className="px-3 py-4">
                      <div className="font-semibold text-slate-900">{workshop.name}</div>
                      <div>{workshop.city}, {workshop.province}</div>
                      <div className="text-xs text-slate-500">/{workshop.slug}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {workshop.featured ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Featured</span> : null}
                        {workshop.mobileService ? <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">Mobile</span> : null}
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">{workshop.subscriptionTier}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div>{workshop.owner.fullName || "No owner name"}</div>
                      <div>{workshop.phone || workshop.whatsapp || "No phone"}</div>
                      <div className="max-w-[220px] break-all text-xs text-slate-500">{workshop.website || workshop.owner.email}</div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex max-w-xs flex-wrap gap-2">
                        {workshop.services.length ? workshop.services.map((service) => (
                          <span key={service.categoryId} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{service.category.name}</span>
                        )) : <span className="text-xs text-slate-500">No services linked</span>}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="font-medium text-slate-900">{Number(workshop.ratingAverage).toFixed(1)} ★</div>
                      <div className="text-xs text-slate-500">{workshop.reviewCount} public review{workshop.reviewCount === 1 ? "" : "s"}</div>
                      {workshop.responseMinutes ? <div className="text-xs text-slate-500">Response target: {workshop.responseMinutes} min</div> : null}
                      {workshop.hourlyRate ? <div className="text-xs text-slate-500">Rate: R{workshop.hourlyRate}/hr</div> : null}
                    </td>
                    <td className="px-3 py-4">
                      <form action={updateWorkshop} className="grid gap-2 rounded-2xl bg-slate-50 p-3">
                        <input type="hidden" name="workshopId" value={workshop.id} />
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                          <select name="status" defaultValue={workshop.status} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                            {workshopStatuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </label>
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Tier
                          <select name="subscriptionTier" defaultValue={workshop.subscriptionTier} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                            {subscriptionTiers.map((tier) => (
                              <option key={tier} value={tier}>{tier}</option>
                            ))}
                          </select>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                          <input type="checkbox" name="featured" value="true" defaultChecked={workshop.featured} className="h-4 w-4 rounded border-slate-300" />
                          Featured placement
                        </label>
                        <button type="submit" className="rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white">Save listing</button>
                      </form>
                    </td>
                    <td className="px-3 py-4 text-xs text-slate-500">{formatTimestamp(workshop.updatedAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-8 text-center text-sm text-slate-500" colSpan={6}>No listings available to manage yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Accreditation and trust queue</h2>
          <p className="mt-2 text-sm text-slate-600">
            Verify workshop memberships and keep trust signals accurate before they appear in future public trust cards.
          </p>
        </div>
        <div className="mt-6 overflow-auto">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-3 py-3">Workshop</th>
                <th className="px-3 py-3">Authority</th>
                <th className="px-3 py-3">Membership</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {accreditations.length ? (
                accreditations.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 align-top">
                    <td className="px-3 py-4">
                      <div className="font-semibold text-slate-900">{item.workshop.name}</div>
                      <div className="text-xs text-slate-500">{item.workshop.city}, {item.workshop.province}</div>
                    </td>
                    <td className="px-3 py-4">{item.authority}</td>
                    <td className="px-3 py-4">{item.membershipNumber}</td>
                    <td className="px-3 py-4">
                      <div className="font-medium text-slate-900">{item.status}</div>
                      <div className="text-xs text-slate-500">Created {formatTimestamp(item.createdAt)}</div>
                      {item.verifiedAt ? <div className="text-xs text-slate-500">Verified {formatTimestamp(item.verifiedAt)}</div> : null}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-wrap gap-2">
                        <form action={updateAccreditation}>
                          <input type="hidden" name="accreditationId" value={item.id} />
                          <input type="hidden" name="status" value="VERIFIED" />
                          <button type="submit" className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Verify</button>
                        </form>
                        <form action={updateAccreditation}>
                          <input type="hidden" name="accreditationId" value={item.id} />
                          <input type="hidden" name="status" value="REJECTED" />
                          <button type="submit" className="rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold text-white">Reject</button>
                        </form>
                        <form action={updateAccreditation}>
                          <input type="hidden" name="accreditationId" value={item.id} />
                          <input type="hidden" name="status" value="PENDING" />
                          <button type="submit" className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">Reset</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-8 text-center text-sm text-slate-500" colSpan={5}>No accreditation checks are waiting right now.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
