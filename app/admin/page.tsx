import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Inbox,
  LayoutDashboard,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles
} from "lucide-react";
import { getPrisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const leadStatuses = ["ALL", "NEW", "QUALIFIED", "ASSIGNED", "CLOSED_WON", "CLOSED_LOST", "SPAM"] as const;
const workshopStatuses = ["ALL", "PENDING", "VERIFIED", "REJECTED", "SUSPENDED"] as const;
const accreditationStatuses = ["PENDING", "VERIFIED", "REJECTED"] as const;
const subscriptionTiers = ["FREE", "GROWTH", "PRO"] as const;
const leadSortOptions = ["newest", "oldest", "status"] as const;
const workshopSortOptions = ["featured", "recent", "rating", "name"] as const;

type LeadStatusFilter = (typeof leadStatuses)[number];
type WorkshopStatusFilter = (typeof workshopStatuses)[number];
type LeadSort = (typeof leadSortOptions)[number];
type WorkshopSort = (typeof workshopSortOptions)[number];
type ViewKey = "overview" | "leads" | "workshops" | "quotes" | "trust" | "settings";

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

function getStringParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function getLeadStatusBadge(status: string) {
  switch (status) {
    case "NEW":
      return "bg-sky-50 text-sky-700 ring-sky-200";
    case "QUALIFIED":
      return "bg-violet-50 text-violet-700 ring-violet-200";
    case "ASSIGNED":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "CLOSED_WON":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "CLOSED_LOST":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    case "SPAM":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

function getWorkshopStatusBadge(status: string) {
  switch (status) {
    case "VERIFIED":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "PENDING":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 ring-rose-200";
    case "SUSPENDED":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

async function updateLeadStatus(formData: FormData) {
  "use server";

  await requireAdminSession();
  const prisma = getPrisma();
  if (!prisma) return;

  const leadId = String(formData.get("leadId") || "");
  const status = String(formData.get("status") || "");

  if (!leadId || !leadStatuses.includes(status as LeadStatusFilter) || status === "ALL") return;

  await prisma.lead.update({
    where: { id: leadId },
    data: { status: status as Exclude<LeadStatusFilter, "ALL"> }
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
  if (!workshopStatuses.includes(status as WorkshopStatusFilter) || status === "ALL") return;
  if (!subscriptionTiers.includes(subscriptionTier as (typeof subscriptionTiers)[number])) return;

  await prisma.workshop.update({
    where: { id: workshopId },
    data: {
      status: status as Exclude<WorkshopStatusFilter, "ALL">,
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

const navItems = [
  { key: "overview", label: "Overview", icon: LayoutDashboard, hint: "Command centre" },
  { key: "leads", label: "Leads", icon: Inbox, hint: "Search and route requests" },
  { key: "workshops", label: "Workshops", icon: Building2, hint: "Listings and visibility" },
  { key: "quotes", label: "Quotes", icon: ReceiptText, hint: "Routing and pipeline" },
  { key: "trust", label: "Trust", icon: ShieldCheck, hint: "Accreditation review" },
  { key: "settings", label: "Settings", icon: Settings, hint: "Ops checklist" }
] as const;

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireAdminSession();
  const params = (await searchParams) ?? {};
  const prisma = getPrisma();

  const requestedView = getStringParam(params.view) as ViewKey;
  const view: ViewKey = navItems.some((item) => item.key === requestedView) ? requestedView : "overview";
  const q = getStringParam(params.q);
  const leadStatusFilter = (leadStatuses.includes(getStringParam(params.leadStatus) as LeadStatusFilter)
    ? getStringParam(params.leadStatus)
    : "ALL") as LeadStatusFilter;
  const workshopStatusFilter = (workshopStatuses.includes(getStringParam(params.workshopStatus) as WorkshopStatusFilter)
    ? getStringParam(params.workshopStatus)
    : "ALL") as WorkshopStatusFilter;
  const leadSort = (leadSortOptions.includes(getStringParam(params.leadSort) as LeadSort)
    ? getStringParam(params.leadSort)
    : "newest") as LeadSort;
  const workshopSort = (workshopSortOptions.includes(getStringParam(params.workshopSort) as WorkshopSort)
    ? getStringParam(params.workshopSort)
    : "featured") as WorkshopSort;

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
        prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 80 }),
        prisma.workshop.findMany({
          include: {
            services: { include: { category: true } },
            owner: true,
            subscription: true,
            accreditations: true
          },
          orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
          take: 120
        }),
        prisma.leadAssignment.findMany({
          include: {
            lead: true,
            workshop: true,
            quote: true
          },
          orderBy: { assignedAt: "desc" },
          take: 60
        }),
        prisma.accreditation.findMany({
          include: { workshop: true },
          orderBy: [{ status: "asc" }, { createdAt: "desc" }],
          take: 60
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

  const query = normalizeQuery(q);

  const filteredLeads = [...leads]
    .filter((lead) => (leadStatusFilter === "ALL" ? true : lead.status === leadStatusFilter))
    .filter((lead) => {
      if (!query) return true;
      return [lead.fullName, lead.email, lead.phone, lead.location, lead.vehicleLabel, lead.serviceNeeded, lead.city || "", lead.province || "", lead.details || ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => {
      if (leadSort === "oldest") return a.createdAt.getTime() - b.createdAt.getTime();
      if (leadSort === "status") return a.status.localeCompare(b.status) || b.createdAt.getTime() - a.createdAt.getTime();
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  const filteredWorkshops = [...workshops]
    .filter((workshop) => (workshopStatusFilter === "ALL" ? true : workshop.status === workshopStatusFilter))
    .filter((workshop) => {
      if (!query) return true;
      const haystack = [
        workshop.name,
        workshop.city,
        workshop.province,
        workshop.slug,
        workshop.owner.fullName || "",
        workshop.phone || "",
        workshop.whatsapp || "",
        workshop.website || "",
        ...workshop.services.map((service) => service.category.name)
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => {
      if (workshopSort === "name") return a.name.localeCompare(b.name);
      if (workshopSort === "rating") return Number(b.ratingAverage) - Number(a.ratingAverage);
      if (workshopSort === "recent") return b.updatedAt.getTime() - a.updatedAt.getTime();
      return Number(b.featured) - Number(a.featured) || b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  const totalPipelineValue = quoteAggregate._sum.totalCents || 0;
  const recentActivity = [
    ...assignments.slice(0, 3).map((assignment) => ({
      id: assignment.id,
      title: `${assignment.workshop.name} received ${assignment.lead.fullName}'s request`,
      detail: `${assignment.lead.serviceNeeded} · ${assignment.status}${assignment.quote ? ` · ${formatCurrencyFromCents(assignment.quote.totalCents)}` : ""}`,
      timestamp: formatTimestamp(assignment.assignedAt)
    })),
    ...accreditations.slice(0, 3).map((item) => ({
      id: item.id,
      title: `${item.workshop.name} accreditation review`,
      detail: `${item.authority} · ${item.status}`,
      timestamp: formatTimestamp(item.createdAt)
    }))
  ]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 6);

  const cards = [
    {
      label: "Submitted quote requests",
      value: String(leadCount),
      detail: `${newLeadCount} new and ${activeLeadCount} in active routing today.`,
      tone: "from-sky-500/15 to-sky-500/5"
    },
    {
      label: "Open request queue",
      value: String(newLeadCount + activeLeadCount),
      detail: "Requests that still need qualification, workshop routing, or follow-up.",
      tone: "from-violet-500/15 to-violet-500/5"
    },
    {
      label: "Live and pending listings",
      value: String(workshopCount),
      detail: `${pendingWorkshopCount} listing${pendingWorkshopCount === 1 ? "" : "s"} currently waiting for review.`,
      tone: "from-amber-500/15 to-amber-500/5"
    },
    {
      label: "Quoted pipeline value",
      value: formatCurrencyFromCents(totalPipelineValue),
      detail: `${quoteCount} quote${quoteCount === 1 ? "" : "s"} tracked inside the admin workflow.`,
      tone: "from-emerald-500/15 to-emerald-500/5"
    }
  ];

  const currentNav = navItems.find((item) => item.key === view) || navItems[0];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef5ff_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-[radial-gradient(circle_at_top,#1a3b6c,transparent_45%),linear-gradient(180deg,#08111f,#0b1730)] px-6 py-8 text-white shadow-soft lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 backdrop-blur">
                <Sparkles className="h-4 w-4 text-accent" />
                Phase 1 admin workspace refresh
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">Run marketplace operations from one clearer command centre.</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                The Bonnet admin now uses a more usable operations layout with module navigation, faster filtering, cleaner cards, and dedicated sections for leads, listings, quotes, trust reviews, and deployment readiness.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Search and filter basics</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Sidebar navigation</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Brand favicon installed</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-200">
                Signed in as <span className="font-semibold text-white">{session.email}</span>
              </div>
              <form action="/api/admin/logout" method="post">
                <button type="submit" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/5">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>

        {!prisma ? (
          <div className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              Railway PostgreSQL is not connected in this environment yet. Public pages can still render, but live admin data, filtering, and moderation controls only work once DATABASE_URL is available.
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-soft">
              <div className="px-2 pb-3">
                <div className="text-sm font-semibold text-slate-950">Admin modules</div>
                <div className="mt-1 text-xs leading-6 text-slate-500">Jump between overview, pipeline, listings, trust, and setup tasks.</div>
              </div>
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = item.key === view;
                  return (
                    <Link
                      key={item.key}
                      href={`/admin?view=${item.key}`}
                      className={`flex items-center justify-between rounded-[1.25rem] px-3 py-3 transition ${
                        active ? "bg-ink text-white shadow-soft" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`rounded-2xl p-2 ${active ? "bg-white/10" : "bg-slate-100 text-slate-700"}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="text-sm font-semibold">{item.label}</div>
                          <div className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>{item.hint}</div>
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 ${active ? "text-slate-300" : "text-slate-400"}`} />
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Activity className="h-4 w-4 text-accent" />
                Quick actions
              </div>
              <div className="mt-4 space-y-3">
                <Link href="/request-quote" className="flex items-center justify-between rounded-[1.25rem] bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
                  View customer quote form
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </Link>
                <Link href="/mechanics" className="flex items-center justify-between rounded-[1.25rem] bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
                  Check public workshop directory
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </Link>
                <Link href="/api/health" className="flex items-center justify-between rounded-[1.25rem] bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100">
                  Open health endpoint
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
              <div className="text-sm font-semibold text-slate-950">At a glance</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-[1.25rem] bg-slate-50 px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Featured listings</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">{featuredCount}</div>
                </div>
                <div className="rounded-[1.25rem] bg-slate-50 px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Pending trust checks</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">{pendingAccreditationCount}</div>
                </div>
                <div className="rounded-[1.25rem] bg-slate-50 px-4 py-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Current view</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-950">{currentNav.label}</div>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {cards.map((item) => (
                <div key={item.label} className={`rounded-[2rem] border border-slate-200 bg-gradient-to-br ${item.tone} from-white to-white p-5 shadow-soft`}>
                  <div className="text-sm text-slate-500">{item.label}</div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{item.value}</div>
                  <div className="mt-3 text-sm leading-7 text-slate-600">{item.detail}</div>
                </div>
              ))}
            </div>

            {view === "overview" ? (
              <>
                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Today priorities</div>
                        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Focus the team on the next operational bottlenecks.</h2>
                      </div>
                      <Sparkles className="h-5 w-5 text-accent" />
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <Link href="/admin?view=leads&leadStatus=NEW" className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white">
                        <div className="text-sm text-slate-500">Lead queue</div>
                        <div className="mt-2 text-3xl font-semibold text-slate-950">{newLeadCount}</div>
                        <div className="mt-2 text-sm text-slate-600">New customer requests waiting for triage and qualification.</div>
                      </Link>
                      <Link href="/admin?view=workshops&workshopStatus=PENDING" className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white">
                        <div className="text-sm text-slate-500">Listing approvals</div>
                        <div className="mt-2 text-3xl font-semibold text-slate-950">{pendingWorkshopCount}</div>
                        <div className="mt-2 text-sm text-slate-600">Workshop profiles that still need review before going fully live.</div>
                      </Link>
                      <Link href="/admin?view=quotes" className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white">
                        <div className="text-sm text-slate-500">Quote pipeline</div>
                        <div className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrencyFromCents(totalPipelineValue)}</div>
                        <div className="mt-2 text-sm text-slate-600">Tracked quote value across submitted responses and routed leads.</div>
                      </Link>
                      <Link href="/admin?view=trust" className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white">
                        <div className="text-sm text-slate-500">Trust review</div>
                        <div className="mt-2 text-3xl font-semibold text-slate-950">{pendingAccreditationCount}</div>
                        <div className="mt-2 text-sm text-slate-600">Accreditation items that need verification or rejection.</div>
                      </Link>
                    </div>
                  </section>

                  <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                      <Clock3 className="h-4 w-4" />
                      Recent activity
                    </div>
                    <div className="mt-5 space-y-4">
                      {recentActivity.length ? (
                        recentActivity.map((item) => (
                          <div key={item.id} className="rounded-[1.5rem] border border-slate-200 p-4">
                            <div className="text-sm font-semibold text-slate-950">{item.title}</div>
                            <div className="mt-1 text-sm text-slate-600">{item.detail}</div>
                            <div className="mt-2 text-xs text-slate-500">{item.timestamp}</div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                          Activity will appear here as soon as requests are routed and trust checks begin.
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                  <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                      <SlidersHorizontal className="h-4 w-4" />
                      Admin improvements in this phase
                    </div>
                    <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                      <li>Sidebar navigation so the console feels like a real workspace instead of a single long page.</li>
                      <li>Module-specific views for overview, leads, workshops, quotes, trust, and settings.</li>
                      <li>Basic search, filter, and sort controls for leads and workshop operations.</li>
                      <li>Favicon, icon pack, and manifest installed from the current brand logo.</li>
                    </ul>
                  </section>

                  <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                      <BadgeCheck className="h-4 w-4" />
                      Marketplace health snapshot
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                        <div className="text-xs uppercase tracking-wide text-slate-500">Requests needing action</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-950">{newLeadCount + activeLeadCount}</div>
                      </div>
                      <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                        <div className="text-xs uppercase tracking-wide text-slate-500">Verified or featured supply</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-950">{featuredCount}</div>
                      </div>
                      <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                        <div className="text-xs uppercase tracking-wide text-slate-500">Quotes logged</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-950">{quoteCount}</div>
                      </div>
                      <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                        <div className="text-xs uppercase tracking-wide text-slate-500">Accreditation queue</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-950">{pendingAccreditationCount}</div>
                      </div>
                    </div>
                  </section>
                </div>
              </>
            ) : null}

            {view === "leads" ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Leads workspace</div>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">Search, filter, and triage incoming customer quote requests.</h2>
                  </div>
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{filteredLeads.length} lead{filteredLeads.length === 1 ? "" : "s"} shown</div>
                </div>

                <form className="mt-6 grid gap-3 rounded-[1.5rem] bg-slate-50 p-4 lg:grid-cols-[minmax(0,1fr)_180px_160px_auto]" method="get">
                  <input type="hidden" name="view" value="leads" />
                  <label className="text-sm text-slate-600">
                    <span className="mb-2 flex items-center gap-2 font-medium"><Search className="h-4 w-4" /> Search</span>
                    <input name="q" defaultValue={q} placeholder="Customer, service, vehicle, city, or phone" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-accent" />
                  </label>
                  <label className="text-sm text-slate-600">
                    <span className="mb-2 block font-medium">Status</span>
                    <select name="leadStatus" defaultValue={leadStatusFilter} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-accent">
                      {leadStatuses.map((status) => (
                        <option key={status} value={status}>{status === "ALL" ? "All statuses" : status}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-slate-600">
                    <span className="mb-2 block font-medium">Sort</span>
                    <select name="leadSort" defaultValue={leadSort} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-accent">
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="status">Status</option>
                    </select>
                  </label>
                  <div className="flex items-end gap-3">
                    <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">Apply</button>
                    <Link href="/admin?view=leads" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">Reset</Link>
                  </div>
                </form>

                <div className="mt-6 overflow-auto">
                  <table className="min-w-full text-left text-sm text-slate-600">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="px-3 py-3">Customer</th>
                        <th className="px-3 py-3">Vehicle</th>
                        <th className="px-3 py-3">Job</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-3 py-3">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.length ? (
                        filteredLeads.map((lead) => (
                          <tr key={lead.id} className="border-b border-slate-100 align-top">
                            <td className="px-3 py-4">
                              <div className="font-semibold text-slate-900">{lead.fullName}</div>
                              <div>{lead.email}</div>
                              <div>{lead.phone}</div>
                              <div className="mt-1 text-xs text-slate-500">{[lead.city, lead.province].filter(Boolean).join(", ") || lead.location}</div>
                            </td>
                            <td className="px-3 py-4">
                              <div className="font-medium text-slate-900">{lead.vehicleLabel}</div>
                              {lead.preferredDate ? <div className="mt-1 text-xs text-slate-500">Preferred: {formatTimestamp(lead.preferredDate)}</div> : null}
                            </td>
                            <td className="px-3 py-4">
                              <div className="font-medium text-slate-900">{lead.serviceNeeded}</div>
                              {lead.urgency ? <div className="mt-1 text-xs text-slate-500">Urgency: {lead.urgency}</div> : null}
                              {lead.details ? <div className="mt-2 max-w-xs text-xs leading-6 text-slate-500">{lead.details}</div> : null}
                            </td>
                            <td className="px-3 py-4">
                              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getLeadStatusBadge(lead.status)}`}>{lead.status}</div>
                              <form action={updateLeadStatus} className="mt-3 flex flex-col gap-2 rounded-[1.25rem] bg-slate-50 p-3">
                                <input type="hidden" name="leadId" value={lead.id} />
                                <select name="status" defaultValue={lead.status} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                                  {leadStatuses.filter((status) => status !== "ALL").map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                                </select>
                                <button type="submit" className="rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white">Update status</button>
                              </form>
                            </td>
                            <td className="px-3 py-4 text-xs text-slate-500">{formatTimestamp(lead.createdAt)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-10 text-center text-sm text-slate-500" colSpan={5}>No leads match the current search or filter.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            {view === "workshops" ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Workshop workspace</div>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">Approve listings, change visibility, and manage subscription presentation.</h2>
                  </div>
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{filteredWorkshops.length} workshop{filteredWorkshops.length === 1 ? "" : "s"} shown</div>
                </div>

                <form className="mt-6 grid gap-3 rounded-[1.5rem] bg-slate-50 p-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]" method="get">
                  <input type="hidden" name="view" value="workshops" />
                  <label className="text-sm text-slate-600">
                    <span className="mb-2 flex items-center gap-2 font-medium"><Search className="h-4 w-4" /> Search</span>
                    <input name="q" defaultValue={q} placeholder="Workshop, city, owner, service, or website" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-accent" />
                  </label>
                  <label className="text-sm text-slate-600">
                    <span className="mb-2 block font-medium">Status</span>
                    <select name="workshopStatus" defaultValue={workshopStatusFilter} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-accent">
                      {workshopStatuses.map((status) => (
                        <option key={status} value={status}>{status === "ALL" ? "All statuses" : status}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-slate-600">
                    <span className="mb-2 block font-medium">Sort</span>
                    <select name="workshopSort" defaultValue={workshopSort} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-accent">
                      <option value="featured">Featured then recent</option>
                      <option value="recent">Recently updated</option>
                      <option value="rating">Highest rating</option>
                      <option value="name">Alphabetical</option>
                    </select>
                  </label>
                  <div className="flex items-end gap-3">
                    <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">Apply</button>
                    <Link href="/admin?view=workshops" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">Reset</Link>
                  </div>
                </form>

                <div className="mt-6 grid gap-5 xl:grid-cols-2">
                  {filteredWorkshops.length ? (
                    filteredWorkshops.map((workshop) => (
                      <div key={workshop.id} className="rounded-[2rem] border border-slate-200 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-semibold text-slate-950">{workshop.name}</h3>
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getWorkshopStatusBadge(workshop.status)}`}>{workshop.status}</span>
                            </div>
                            <div className="mt-1 text-sm text-slate-600">{workshop.city}, {workshop.province} · /{workshop.slug}</div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {workshop.featured ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Featured</span> : null}
                            {workshop.mobileService ? <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">Mobile</span> : null}
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{workshop.subscriptionTier}</span>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-600">
                            <div className="font-semibold text-slate-900">Owner and contact</div>
                            <div className="mt-2">{workshop.owner.fullName || "No owner name"}</div>
                            <div>{workshop.phone || workshop.whatsapp || "No phone"}</div>
                            <div className="break-all text-xs text-slate-500">{workshop.website || workshop.owner.email}</div>
                          </div>
                          <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-600">
                            <div className="font-semibold text-slate-900">Performance</div>
                            <div className="mt-2">{Number(workshop.ratingAverage).toFixed(1)} ★</div>
                            <div className="text-xs text-slate-500">{workshop.reviewCount} public review{workshop.reviewCount === 1 ? "" : "s"}</div>
                            {workshop.responseMinutes ? <div className="text-xs text-slate-500">Response target: {workshop.responseMinutes} min</div> : null}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {workshop.services.length ? (
                            workshop.services.map((service) => (
                              <span key={service.categoryId} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{service.category.name}</span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">No services linked</span>
                          )}
                        </div>

                        <form action={updateWorkshop} className="mt-5 grid gap-3 rounded-[1.5rem] bg-slate-50 p-4 sm:grid-cols-2">
                          <input type="hidden" name="workshopId" value={workshop.id} />
                          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                            <select name="status" defaultValue={workshop.status} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                              {workshopStatuses.filter((status) => status !== "ALL").map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </label>
                          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Tier
                            <select name="subscriptionTier" defaultValue={workshop.subscriptionTier} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                              {subscriptionTiers.map((tier) => (
                                <option key={tier} value={tier}>{tier}</option>
                              ))}
                            </select>
                          </label>
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                            <input type="checkbox" name="featured" value="true" defaultChecked={workshop.featured} className="h-4 w-4 rounded border-slate-300" />
                            Promote as featured listing on the public marketplace
                          </label>
                          <div className="text-xs text-slate-500 sm:col-span-2">Updated {formatTimestamp(workshop.updatedAt)}</div>
                          <div className="sm:col-span-2">
                            <button type="submit" className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white">Save workshop changes</button>
                          </div>
                        </form>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-10 text-sm text-slate-500 xl:col-span-2">
                      No workshops match the current search or filter.
                    </div>
                  )}
                </div>
              </section>
            ) : null}

            {view === "quotes" ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Quote workspace</div>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Track routing activity and quote responses without leaving the admin console.</h2>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Assignments tracked</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-950">{assignments.length}</div>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Quotes submitted</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-950">{quoteCount}</div>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Pipeline value</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrencyFromCents(totalPipelineValue)}</div>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {assignments.length ? (
                    assignments.map((assignment) => (
                      <div key={assignment.id} className="rounded-[1.5rem] border border-slate-200 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-semibold text-slate-950">{assignment.workshop.name}</div>
                            <div className="mt-1 text-sm text-slate-600">{assignment.lead.fullName} · {assignment.lead.serviceNeeded} · {assignment.lead.vehicleLabel}</div>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{assignment.status}</span>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                          <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-600">
                            <div className="font-semibold text-slate-900">Assigned</div>
                            <div className="mt-2">{formatTimestamp(assignment.assignedAt)}</div>
                            {assignment.viewedAt ? <div className="text-xs text-slate-500">Viewed {formatTimestamp(assignment.viewedAt)}</div> : null}
                          </div>
                          <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-600">
                            <div className="font-semibold text-slate-900">Lead fee</div>
                            <div className="mt-2">{assignment.leadPriceCents ? formatCurrencyFromCents(assignment.leadPriceCents) : "Not set"}</div>
                            {assignment.respondedAt ? <div className="text-xs text-slate-500">Responded {formatTimestamp(assignment.respondedAt)}</div> : null}
                          </div>
                          <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-600">
                            <div className="font-semibold text-slate-900">Quote</div>
                            {assignment.quote ? (
                              <>
                                <div className="mt-2 font-medium text-slate-900">{assignment.quote.status} · {formatCurrencyFromCents(assignment.quote.totalCents)}</div>
                                <div className="text-xs text-slate-500">{assignment.quote.etaText ? `ETA ${assignment.quote.etaText}` : "No ETA added"}</div>
                              </>
                            ) : (
                              <div className="mt-2 text-sm text-slate-500">No quote submitted yet.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-10 text-sm text-slate-500">No lead assignments or quote activity yet.</div>
                  )}
                </div>
              </section>
            ) : null}

            {view === "trust" ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Trust workspace</div>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">Verify workshop accreditations and keep marketplace trust signals clean.</h2>
                  </div>
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{accreditations.length} trust item{accreditations.length === 1 ? "" : "s"}</div>
                </div>
                <div className="mt-6 space-y-4">
                  {accreditations.length ? (
                    accreditations.map((item) => (
                      <div key={item.id} className="rounded-[1.5rem] border border-slate-200 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-semibold text-slate-950">{item.workshop.name}</div>
                            <div className="mt-1 text-sm text-slate-600">{item.workshop.city}, {item.workshop.province}</div>
                          </div>
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getWorkshopStatusBadge(item.status)}`}>{item.status}</span>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                          <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-600">
                            <div className="font-semibold text-slate-900">Authority</div>
                            <div className="mt-2">{item.authority}</div>
                            <div className="text-xs text-slate-500">Membership #{item.membershipNumber}</div>
                          </div>
                          <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-600">
                            <div className="font-semibold text-slate-900">Timeline</div>
                            <div className="mt-2">Created {formatTimestamp(item.createdAt)}</div>
                            {item.verifiedAt ? <div className="text-xs text-slate-500">Verified {formatTimestamp(item.verifiedAt)}</div> : null}
                          </div>
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
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-10 text-sm text-slate-500">No accreditation checks are waiting right now.</div>
                  )}
                </div>
              </section>
            ) : null}

            {view === "settings" ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Settings and readiness</div>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Keep Railway deployment, branding, and admin access in a healthy state.</h2>
                </div>
                <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
                  <div className="rounded-[1.75rem] border border-slate-200 p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <Settings className="h-4 w-4 text-accent" />
                      Deployment checklist
                    </div>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                      <li>Ensure Railway variables include DATABASE_URL, NEXT_PUBLIC_SITE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_SESSION_SECRET.</li>
                      <li>Keep the pre-deploy command set to <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">npx prisma migrate deploy && npm run seed:real-data && npm run seed:super-admin</span>.</li>
                      <li>Use <Link href="/api/health" className="font-semibold text-accent">/api/health</Link> after each deploy to confirm database connectivity.</li>
                    </ul>
                  </div>
                  <div className="rounded-[1.75rem] border border-slate-200 p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <BadgeCheck className="h-4 w-4 text-accent" />
                      Brand install
                    </div>
                    <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                      <li>Favicon package generated from the existing The Bonnet logo.</li>
                      <li>Apple touch icon, Android icons, web manifest, and browser tab icon are now included.</li>
                      <li>Metadata can now show a more complete brand presence in browser tabs and saved shortcuts.</li>
                    </ul>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
