import Link from "next/link";
import { revalidatePath } from "next/cache";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
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
  Sparkles,
  Users
} from "lucide-react";
import type { AdminRole, AdminUserStatus } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import {
  adminRoles,
  canAdminAccess,
  getRoleLabel,
  logAdminAction,
  normalizeEmail,
  hashAdminPassword,
  requireAdminUser
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const leadStatuses = ["ALL", "NEW", "QUALIFIED", "ASSIGNED", "CLOSED_WON", "CLOSED_LOST", "SPAM"] as const;
const workshopStatuses = ["ALL", "PENDING", "VERIFIED", "REJECTED", "SUSPENDED"] as const;
const accreditationStatuses = ["PENDING", "VERIFIED", "REJECTED"] as const;
const subscriptionTiers = ["FREE", "GROWTH", "PRO"] as const;
const adminUserStatuses = ["ACTIVE", "INVITED", "DISABLED"] as const satisfies Readonly<AdminUserStatus[]>;
const leadSortOptions = ["newest", "oldest", "status"] as const;
const workshopSortOptions = ["featured", "recent", "rating", "name"] as const;

type LeadStatusFilter = (typeof leadStatuses)[number];
type WorkshopStatusFilter = (typeof workshopStatuses)[number];
type LeadSort = (typeof leadSortOptions)[number];
type WorkshopSort = (typeof workshopSortOptions)[number];
type ViewKey = "overview" | "leads" | "workshops" | "quotes" | "trust" | "analytics" | "users" | "settings";

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

function getAdminStatusBadge(status: AdminUserStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "INVITED":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "DISABLED":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

async function updateLeadStatus(formData: FormData) {
  "use server";

  const admin = await requireAdminUser("manageLeads");
  const prisma = getPrisma();
  if (!prisma) return;

  const leadId = String(formData.get("leadId") || "");
  const status = String(formData.get("status") || "");
  if (!leadId || !leadStatuses.includes(status as LeadStatusFilter) || status === "ALL") return;

  await prisma.lead.update({
    where: { id: leadId },
    data: { status: status as Exclude<LeadStatusFilter, "ALL"> }
  });

  await logAdminAction({
    actorId: admin.id,
    action: "lead.status_updated",
    entityType: "lead",
    entityId: leadId,
    summary: `${admin.email} changed lead status to ${status}.`,
    metadata: { status }
  });

  revalidatePath("/admin");
}

async function updateWorkshop(formData: FormData) {
  "use server";

  const admin = await requireAdminUser("manageWorkshops");
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

  await logAdminAction({
    actorId: admin.id,
    action: "workshop.updated",
    entityType: "workshop",
    entityId: workshopId,
    summary: `${admin.email} updated workshop controls.`,
    metadata: { status, featured, subscriptionTier }
  });

  revalidatePath("/admin");
}

async function updateAccreditation(formData: FormData) {
  "use server";

  const admin = await requireAdminUser("manageTrust");
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

  await logAdminAction({
    actorId: admin.id,
    action: "accreditation.updated",
    entityType: "accreditation",
    entityId: accreditationId,
    summary: `${admin.email} changed accreditation status to ${status}.`,
    metadata: { status }
  });

  revalidatePath("/admin");
}

async function createAdminUser(formData: FormData) {
  "use server";

  const admin = await requireAdminUser("manageAdminUsers");
  const prisma = getPrisma();
  if (!prisma) return;

  const fullName = String(formData.get("fullName") || "").trim();
  const email = normalizeEmail(String(formData.get("email") || ""));
  const role = String(formData.get("role") || "SUPPORT_ADMIN") as AdminRole;
  const password = String(formData.get("password") || "");

  if (!fullName || !email || password.length < 8 || !adminRoles.includes(role)) return;

  const passwordHash = await hashAdminPassword(password);

  await prisma.adminUser.upsert({
    where: { email },
    update: {
      fullName,
      passwordHash,
      role,
      status: "ACTIVE",
      invitedById: admin.id || undefined
    },
    create: {
      fullName,
      email,
      passwordHash,
      role,
      status: "ACTIVE",
      invitedById: admin.id || undefined
    }
  });

  await prisma.profile.upsert({
    where: { email },
    update: {
      fullName,
      role: "ADMIN"
    },
    create: {
      email,
      fullName,
      role: "ADMIN"
    }
  });

  await logAdminAction({
    actorId: admin.id,
    action: "admin_user.created",
    entityType: "admin_user",
    entityId: email,
    summary: `${admin.email} created or refreshed admin access for ${email}.`,
    metadata: { role }
  });

  revalidatePath("/admin");
}

async function updateAdminUser(formData: FormData) {
  "use server";

  const admin = await requireAdminUser("manageAdminUsers");
  const prisma = getPrisma();
  if (!prisma) return;

  const adminUserId = String(formData.get("adminUserId") || "");
  const role = String(formData.get("role") || "SUPPORT_ADMIN") as AdminRole;
  const status = String(formData.get("status") || "ACTIVE") as AdminUserStatus;

  if (!adminUserId || !adminRoles.includes(role) || !adminUserStatuses.includes(status)) return;
  if (admin.id && admin.id === adminUserId && status === "DISABLED") return;

  await prisma.adminUser.update({
    where: { id: adminUserId },
    data: { role, status }
  });

  await logAdminAction({
    actorId: admin.id,
    action: "admin_user.updated",
    entityType: "admin_user",
    entityId: adminUserId,
    summary: `${admin.email} changed an admin account role or status.`,
    metadata: { role, status }
  });

  revalidatePath("/admin");
}

const navItems: Array<{ key: ViewKey; label: string; hint: string; icon: typeof LayoutDashboard; permission: Parameters<typeof requireAdminUser>[0] }> = [
  { key: "overview", label: "Overview", icon: LayoutDashboard, hint: "Command centre", permission: "viewDashboard" },
  { key: "leads", label: "Leads", icon: Inbox, hint: "Search and route requests", permission: "manageLeads" },
  { key: "workshops", label: "Workshops", icon: Building2, hint: "Listings and visibility", permission: "manageWorkshops" },
  { key: "quotes", label: "Quotes", icon: ReceiptText, hint: "Routing and pipeline", permission: "manageQuotes" },
  { key: "trust", label: "Trust", icon: ShieldCheck, hint: "Accreditation review", permission: "manageTrust" },
  { key: "analytics", label: "Analytics", icon: BarChart3, hint: "Demand and conversion", permission: "viewAnalytics" },
  { key: "users", label: "Admin users", icon: Users, hint: "Roles and access", permission: "manageAdminUsers" },
  { key: "settings", label: "Settings", icon: Settings, hint: "Environment and rollout", permission: "manageSettings" }
];

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const adminUser = await requireAdminUser("viewDashboard");
  const params = (await searchParams) ?? {};
  const prisma = getPrisma();

  const availableNav = navItems.filter((item) => canAdminAccess(adminUser.role, item.permission!));
  const requestedView = getStringParam(params.view) as ViewKey;
  const view = availableNav.some((item) => item.key === requestedView) ? requestedView : availableNav[0]?.key || "overview";
  const q = getStringParam(params.q);
  const denied = getStringParam(params.denied) === "1";
  const leadStatusFilter = (leadStatuses.includes(getStringParam(params.leadStatus) as LeadStatusFilter) ? getStringParam(params.leadStatus) : "ALL") as LeadStatusFilter;
  const workshopStatusFilter = (workshopStatuses.includes(getStringParam(params.workshopStatus) as WorkshopStatusFilter) ? getStringParam(params.workshopStatus) : "ALL") as WorkshopStatusFilter;
  const leadSort = (leadSortOptions.includes(getStringParam(params.leadSort) as LeadSort) ? getStringParam(params.leadSort) : "newest") as LeadSort;
  const workshopSort = (workshopSortOptions.includes(getStringParam(params.workshopSort) as WorkshopSort) ? getStringParam(params.workshopSort) : "featured") as WorkshopSort;

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
        prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 60 }),
        prisma.workshop.findMany({
          include: { services: { include: { category: true } }, owner: true, subscription: true },
          orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
          take: 80
        }),
        prisma.leadAssignment.findMany({ include: { lead: true, workshop: true, quote: true }, orderBy: { assignedAt: "desc" }, take: 40 }),
        prisma.accreditation.findMany({ include: { workshop: true }, orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 40 }),
        canAdminAccess(adminUser.role, "manageAdminUsers")
          ? prisma.adminUser.findMany({ include: { invitedBy: true }, orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 40 })
          : Promise.resolve([]),
        canAdminAccess(adminUser.role, "manageAdminUsers")
          ? prisma.adminAuditLog.findMany({ include: { actor: true }, orderBy: { createdAt: "desc" }, take: 30 })
          : Promise.resolve([])
      ])
    : null;

  const [leadCount, newLeadCount, activeLeadCount, workshopCount, pendingWorkshopCount, featuredCount, quoteCount, quoteAggregate, pendingAccreditationCount, leads, workshops, assignments, accreditations, adminUsers, auditLogs] =
    data || [0, 0, 0, 0, 0, 0, 0, { _sum: { totalCents: 0 } }, 0, [], [], [], [], [], []];

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
      return [workshop.name, workshop.city, workshop.province, workshop.slug, workshop.owner.fullName || "", workshop.phone || "", workshop.whatsapp || "", workshop.website || "", ...workshop.services.map((service) => service.category.name)]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((a, b) => {
      if (workshopSort === "name") return a.name.localeCompare(b.name);
      if (workshopSort === "rating") return Number(b.ratingAverage) - Number(a.ratingAverage);
      if (workshopSort === "recent") return b.updatedAt.getTime() - a.updatedAt.getTime();
      return Number(b.featured) - Number(a.featured) || b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  const totalPipelineValue = quoteAggregate._sum.totalCents || 0;
  const currentNav = availableNav.find((item) => item.key === view) || availableNav[0];
  const recentActivity = [...assignments.slice(0, 3), ...accreditations.slice(0, 3)];
  const quoteSubmittedCount = assignments.filter((assignment) => assignment.quote).length;
  const acceptedQuoteCount = assignments.filter((assignment) => assignment.quote?.status === "ACCEPTED").length;
  const rejectedQuoteCount = assignments.filter((assignment) => assignment.quote?.status === "REJECTED").length;
  const averageQuoteValue = quoteCount ? Math.round(totalPipelineValue / quoteCount) : 0;
  const wonLeadCount = leads.filter((lead) => lead.status === "CLOSED_WON").length;
  const lostLeadCount = leads.filter((lead) => lead.status === "CLOSED_LOST").length;
  const verifiedWorkshopCount = workshops.filter((workshop) => workshop.status === "VERIFIED").length;
  const mobileWorkshopCount = workshops.filter((workshop) => workshop.mobileService).length;
  const averageWorkshopRating = workshops.length
    ? workshops.reduce((sum, workshop) => sum + Number(workshop.ratingAverage || 0), 0) / workshops.length
    : 0;
  const activeAdminCount = adminUsers.filter((item) => item.status === "ACTIVE").length;
  const recentAuditCount = auditLogs.filter((item) => Date.now() - item.createdAt.getTime() <= 1000 * 60 * 60 * 24).length;
  const topDemandServices = Object.entries(
    leads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.serviceNeeded] = (acc[lead.serviceNeeded] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topDemandCities = Object.entries(
    leads.reduce<Record<string, number>>((acc, lead) => {
      const key = [lead.city, lead.province].filter(Boolean).join(", ") || lead.location || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topRatedWorkshops = [...workshops]
    .filter((workshop) => Number(workshop.ratingAverage) > 0)
    .sort((a, b) => Number(b.ratingAverage) - Number(a.ratingAverage) || b.reviewCount - a.reviewCount)
    .slice(0, 5);

  const cards = [
    { label: "Submitted quote requests", value: String(leadCount), detail: `${newLeadCount} new and ${activeLeadCount} in active routing.`, tone: "from-sky-500/15 to-sky-500/5" },
    { label: "Open request queue", value: String(newLeadCount + activeLeadCount), detail: "Requests waiting for qualification or routing.", tone: "from-violet-500/15 to-violet-500/5" },
    { label: "Live and pending listings", value: String(workshopCount), detail: `${pendingWorkshopCount} listing${pendingWorkshopCount === 1 ? "" : "s"} still waiting for review.`, tone: "from-amber-500/15 to-amber-500/5" },
    { label: "Quoted pipeline value", value: formatCurrencyFromCents(totalPipelineValue), detail: `${quoteCount} quote${quoteCount === 1 ? "" : "s"} tracked inside admin.`, tone: "from-emerald-500/15 to-emerald-500/5" }
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef5ff_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-[radial-gradient(circle_at_top,#1a3b6c,transparent_45%),linear-gradient(180deg,#08111f,#0b1730)] px-6 py-8 text-white shadow-soft lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 backdrop-blur">
                <Sparkles className="h-4 w-4 text-accent" />
                Phase 2 shipped · Phase 3 analytics underway
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">Run marketplace operations with role-based team access.</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                My Bonnet admin now supports database-backed admin accounts, role-aware navigation, audit logging, and a cleaner permissions foundation for operations, support, content, and finance workflows.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-200">
                <div>Signed in as <span className="font-semibold text-white">{adminUser.email}</span></div>
                <div className="mt-1 text-xs text-slate-300">{adminUser.fullName} · {adminUser.roleLabel}</div>
              </div>
              <form action="/api/admin/logout" method="post">
                <button type="submit" className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/5">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>

        {denied ? (
          <div className="mt-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            Your admin role does not have access to that module.
          </div>
        ) : null}

        {!prisma ? (
          <div className="mt-6 flex items-start gap-3 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>Railway PostgreSQL is not connected in this environment yet. Live admin data and multi-user access require DATABASE_URL plus the Phase 2 migration.</div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-soft">
              <div className="px-2 pb-3">
                <div className="text-sm font-semibold text-slate-950">Admin modules</div>
                <div className="mt-1 text-xs leading-6 text-slate-500">Only the modules allowed by your role are shown here.</div>
              </div>
              <nav className="space-y-1.5">
                {availableNav.map((item) => {
                  const Icon = item.icon;
                  const active = item.key === view;
                  return (
                    <Link key={item.key} href={`/admin?view=${item.key}`} className={`flex items-center justify-between rounded-[1.25rem] px-3 py-3 transition ${active ? "bg-ink text-white shadow-soft" : "text-slate-700 hover:bg-slate-50"}`}>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-2xl p-2 ${active ? "bg-white/10" : "bg-slate-100 text-slate-700"}`}><Icon className="h-4 w-4" /></span>
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
                <BadgeCheck className="h-4 w-4 text-accent" />
                Access snapshot
              </div>
              <div className="mt-4 rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-700">
                <div className="font-semibold text-slate-950">{adminUser.roleLabel}</div>
                <div className="mt-1 text-xs text-slate-500">{adminUser.permissions.length} granted permission{adminUser.permissions.length === 1 ? "" : "s"}</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {adminUser.permissions.map((permission) => (
                  <span key={permission} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{permission}</span>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Activity className="h-4 w-4 text-accent" />
                Quick actions
              </div>
              <div className="mt-4 space-y-3">
                <Link href="/request-quote" className="flex items-center justify-between rounded-[1.25rem] bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100">View customer quote form <ArrowUpRight className="h-4 w-4 text-slate-400" /></Link>
                <Link href="/mechanics" className="flex items-center justify-between rounded-[1.25rem] bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100">Check public workshop directory <ArrowUpRight className="h-4 w-4 text-slate-400" /></Link>
                <Link href="/api/health" className="flex items-center justify-between rounded-[1.25rem] bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-100">Open health endpoint <ArrowUpRight className="h-4 w-4 text-slate-400" /></Link>
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
              <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Team priorities</div>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">Focus each admin role on the right queue.</h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <Link href="/admin?view=leads&leadStatus=NEW" className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white"><div className="text-sm text-slate-500">Lead queue</div><div className="mt-2 text-3xl font-semibold text-slate-950">{newLeadCount}</div><div className="mt-2 text-sm text-slate-600">New customer requests waiting for triage.</div></Link>
                    <Link href="/admin?view=workshops&workshopStatus=PENDING" className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white"><div className="text-sm text-slate-500">Listing approvals</div><div className="mt-2 text-3xl font-semibold text-slate-950">{pendingWorkshopCount}</div><div className="mt-2 text-sm text-slate-600">Workshop profiles waiting for review.</div></Link>
                    <Link href="/admin?view=quotes" className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white"><div className="text-sm text-slate-500">Quote pipeline</div><div className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrencyFromCents(totalPipelineValue)}</div><div className="mt-2 text-sm text-slate-600">Tracked quote value across routed jobs.</div></Link>
                    <Link href="/admin?view=trust" className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 transition hover:bg-white"><div className="text-sm text-slate-500">Trust review</div><div className="mt-2 text-3xl font-semibold text-slate-950">{pendingAccreditationCount}</div><div className="mt-2 text-sm text-slate-600">Accreditations that still need verification.</div></Link>
                  </div>
                </section>

                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-accent"><Clock3 className="h-4 w-4" /> Recent activity</div>
                  <div className="mt-5 space-y-4">
                    {recentActivity.length ? recentActivity.map((item) => (
                      <div key={item.id} className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-600">
                        <div className="font-semibold text-slate-950">{"lead" in item ? item.workshop.name : item.workshop.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{"lead" in item ? `${item.lead.fullName} · ${item.status}` : `${item.authority} · ${item.status}`}</div>
                        <div className="mt-2 text-xs text-slate-400">{"assignedAt" in item ? formatTimestamp(item.assignedAt) : formatTimestamp(item.createdAt)}</div>
                      </div>
                    )) : <div className="rounded-[1.25rem] border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500">No recent admin activity yet.</div>}
                  </div>
                </section>
              </div>
            ) : null}

            {view === "leads" ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><div className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Leads workspace</div><h2 className="mt-2 text-2xl font-semibold text-slate-950">Search, filter, and triage incoming customer quote requests.</h2></div><div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{filteredLeads.length} lead{filteredLeads.length === 1 ? "" : "s"} shown</div></div>
                <form className="mt-6 grid gap-3 rounded-[1.5rem] bg-slate-50 p-4 lg:grid-cols-[minmax(0,1fr)_180px_160px_auto]" method="get"><input type="hidden" name="view" value="leads" /><label className="text-sm text-slate-600"><span className="mb-2 flex items-center gap-2 font-medium"><Search className="h-4 w-4" /> Search</span><input name="q" defaultValue={q} placeholder="Customer, service, vehicle, city, or phone" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-accent" /></label><label className="text-sm text-slate-600"><span className="mb-2 block font-medium">Status</span><select name="leadStatus" defaultValue={leadStatusFilter} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-accent">{leadStatuses.map((status) => <option key={status} value={status}>{status === "ALL" ? "All statuses" : status}</option>)}</select></label><label className="text-sm text-slate-600"><span className="mb-2 block font-medium">Sort</span><select name="leadSort" defaultValue={leadSort} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-accent"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="status">Status</option></select></label><div className="flex items-end gap-3"><button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">Apply</button><Link href="/admin?view=leads" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">Reset</Link></div></form>
                <div className="mt-6 overflow-auto"><table className="min-w-full text-left text-sm text-slate-600"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Vehicle</th><th className="px-3 py-3">Job</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Submitted</th></tr></thead><tbody>{filteredLeads.length ? filteredLeads.map((lead) => <tr key={lead.id} className="border-b border-slate-100 align-top"><td className="px-3 py-4"><div className="font-semibold text-slate-900">{lead.fullName}</div><div>{lead.email}</div><div>{lead.phone}</div><div className="mt-1 text-xs text-slate-500">{[lead.city, lead.province].filter(Boolean).join(", ") || lead.location}</div></td><td className="px-3 py-4"><div className="font-medium text-slate-900">{lead.vehicleLabel}</div>{lead.preferredDate ? <div className="mt-1 text-xs text-slate-500">Preferred: {formatTimestamp(lead.preferredDate)}</div> : null}</td><td className="px-3 py-4"><div className="font-medium text-slate-900">{lead.serviceNeeded}</div>{lead.urgency ? <div className="mt-1 text-xs text-slate-500">Urgency: {lead.urgency}</div> : null}{lead.details ? <div className="mt-2 max-w-xs text-xs leading-6 text-slate-500">{lead.details}</div> : null}</td><td className="px-3 py-4"><div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getLeadStatusBadge(lead.status)}`}>{lead.status}</div><form action={updateLeadStatus} className="mt-3 flex flex-col gap-2 rounded-[1.25rem] bg-slate-50 p-3"><input type="hidden" name="leadId" value={lead.id} /><select name="status" defaultValue={lead.status} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">{leadStatuses.filter((status) => status !== "ALL").map((status) => <option key={status} value={status}>{status}</option>)}</select><button type="submit" className="rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white">Update status</button></form></td><td className="px-3 py-4 text-xs text-slate-500">{formatTimestamp(lead.createdAt)}</td></tr>) : <tr><td className="px-3 py-10 text-center text-sm text-slate-500" colSpan={5}>No leads match the current search or filter.</td></tr>}</tbody></table></div>
              </section>
            ) : null}

            {view === "workshops" ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><div className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Workshop workspace</div><h2 className="mt-2 text-2xl font-semibold text-slate-950">Approve listings, change visibility, and manage subscription presentation.</h2></div><div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{filteredWorkshops.length} workshop{filteredWorkshops.length === 1 ? "" : "s"} shown</div></div>
                <form className="mt-6 grid gap-3 rounded-[1.5rem] bg-slate-50 p-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]" method="get"><input type="hidden" name="view" value="workshops" /><label className="text-sm text-slate-600"><span className="mb-2 flex items-center gap-2 font-medium"><Search className="h-4 w-4" /> Search</span><input name="q" defaultValue={q} placeholder="Workshop, city, owner, service, or website" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-accent" /></label><label className="text-sm text-slate-600"><span className="mb-2 block font-medium">Status</span><select name="workshopStatus" defaultValue={workshopStatusFilter} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-accent">{workshopStatuses.map((status) => <option key={status} value={status}>{status === "ALL" ? "All statuses" : status}</option>)}</select></label><label className="text-sm text-slate-600"><span className="mb-2 block font-medium">Sort</span><select name="workshopSort" defaultValue={workshopSort} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-accent"><option value="featured">Featured then recent</option><option value="recent">Recently updated</option><option value="rating">Highest rating</option><option value="name">Alphabetical</option></select></label><div className="flex items-end gap-3"><button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">Apply</button><Link href="/admin?view=workshops" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">Reset</Link></div></form>
                <div className="mt-6 grid gap-5 xl:grid-cols-2">{filteredWorkshops.length ? filteredWorkshops.map((workshop) => <div key={workshop.id} className="rounded-[2rem] border border-slate-200 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-semibold text-slate-950">{workshop.name}</h3><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getWorkshopStatusBadge(workshop.status)}`}>{workshop.status}</span></div><div className="mt-1 text-sm text-slate-600">{workshop.city}, {workshop.province} · /{workshop.slug}</div></div><div className="flex flex-wrap gap-2">{workshop.featured ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Featured</span> : null}{workshop.mobileService ? <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">Mobile</span> : null}<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{workshop.subscriptionTier}</span></div></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-600"><div className="font-semibold text-slate-900">Owner and contact</div><div className="mt-2">{workshop.owner.fullName || "No owner name"}</div><div>{workshop.phone || workshop.whatsapp || "No phone"}</div><div className="break-all text-xs text-slate-500">{workshop.website || workshop.owner.email}</div></div><div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-600"><div className="font-semibold text-slate-900">Performance</div><div className="mt-2">{Number(workshop.ratingAverage).toFixed(1)} ★</div><div className="text-xs text-slate-500">{workshop.reviewCount} public review{workshop.reviewCount === 1 ? "" : "s"}</div></div></div><div className="mt-4 flex flex-wrap gap-2">{workshop.services.length ? workshop.services.map((service) => <span key={service.categoryId} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{service.category.name}</span>) : <span className="text-xs text-slate-500">No services linked</span>}</div><form action={updateWorkshop} className="mt-5 grid gap-3 rounded-[1.5rem] bg-slate-50 p-4 sm:grid-cols-2"><input type="hidden" name="workshopId" value={workshop.id} /><label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status<select name="status" defaultValue={workshop.status} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">{workshopStatuses.filter((status) => status !== "ALL").map((status) => <option key={status} value={status}>{status}</option>)}</select></label><label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tier<select name="subscriptionTier" defaultValue={workshop.subscriptionTier} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">{subscriptionTiers.map((tier) => <option key={tier} value={tier}>{tier}</option>)}</select></label><label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2"><input type="checkbox" name="featured" value="true" defaultChecked={workshop.featured} className="h-4 w-4 rounded border-slate-300" />Promote as featured listing</label><div className="sm:col-span-2"><button type="submit" className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white">Save workshop changes</button></div></form></div>) : <div className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-10 text-sm text-slate-500 xl:col-span-2">No workshops match the current search or filter.</div>}</div>
              </section>
            ) : null}

            {view === "quotes" ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <div><div className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Quote workspace</div><h2 className="mt-2 text-2xl font-semibold text-slate-950">Track routing activity and quote responses without leaving the admin console.</h2></div>
                <div className="mt-6 space-y-4">{assignments.length ? assignments.map((assignment) => <div key={assignment.id} className="rounded-[1.5rem] border border-slate-200 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-lg font-semibold text-slate-950">{assignment.workshop.name}</div><div className="mt-1 text-sm text-slate-600">{assignment.lead.fullName} · {assignment.lead.serviceNeeded} · {assignment.lead.vehicleLabel}</div></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{assignment.status}</span></div><div className="mt-4 grid gap-4 md:grid-cols-3"><div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-600"><div className="font-semibold text-slate-900">Assigned</div><div className="mt-2">{formatTimestamp(assignment.assignedAt)}</div></div><div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-600"><div className="font-semibold text-slate-900">Lead fee</div><div className="mt-2">{assignment.leadPriceCents ? formatCurrencyFromCents(assignment.leadPriceCents) : "Not set"}</div></div><div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-600"><div className="font-semibold text-slate-900">Quote</div>{assignment.quote ? <><div className="mt-2 font-medium text-slate-900">{assignment.quote.status} · {formatCurrencyFromCents(assignment.quote.totalCents)}</div><div className="text-xs text-slate-500">{assignment.quote.etaText ? `ETA ${assignment.quote.etaText}` : "No ETA added"}</div></> : <div className="mt-2 text-sm text-slate-500">No quote submitted yet.</div>}</div></div></div>) : <div className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-10 text-sm text-slate-500">No lead assignments or quote activity yet.</div>}</div>
              </section>
            ) : null}

            {view === "trust" ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><div className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Trust workspace</div><h2 className="mt-2 text-2xl font-semibold text-slate-950">Verify workshop accreditations and keep marketplace trust signals clean.</h2></div><div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{accreditations.length} trust item{accreditations.length === 1 ? "" : "s"}</div></div>
                <div className="mt-6 space-y-4">{accreditations.length ? accreditations.map((item) => <div key={item.id} className="rounded-[1.5rem] border border-slate-200 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-lg font-semibold text-slate-950">{item.workshop.name}</div><div className="mt-1 text-sm text-slate-600">{item.workshop.city}, {item.workshop.province}</div></div><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getWorkshopStatusBadge(item.status)}`}>{item.status}</span></div><div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"><div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-600"><div className="font-semibold text-slate-900">Authority</div><div className="mt-2">{item.authority}</div><div className="text-xs text-slate-500">Membership #{item.membershipNumber}</div></div><div className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-600"><div className="font-semibold text-slate-900">Timeline</div><div className="mt-2 text-xs text-slate-500">Created {formatTimestamp(item.createdAt)}</div><div className="text-xs text-slate-500">Verified {formatTimestamp(item.verifiedAt)}</div></div><form action={updateAccreditation} className="grid gap-2"><input type="hidden" name="accreditationId" value={item.id} /><select name="status" defaultValue={item.status} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">{accreditationStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select><button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">Save decision</button></form></div></div>) : <div className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-10 text-sm text-slate-500">No accreditation items yet.</div>}</div>
              </section>
            ) : null}

            {view === "users" ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><div className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Admin users</div><h2 className="mt-2 text-2xl font-semibold text-slate-950">Create team accounts, assign roles, and audit access changes.</h2></div><div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{adminUsers.length} admin account{adminUsers.length === 1 ? "" : "s"}</div></div>
                <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                  <form action={createAdminUser} className="rounded-[1.5rem] bg-slate-50 p-5">
                    <div className="text-sm font-semibold text-slate-950">Add or refresh an admin account</div>
                    <div className="mt-4 grid gap-3"><input name="fullName" placeholder="Full name" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" required /><input type="email" name="email" placeholder="name@thebonnet.co.za" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" required /><select name="role" defaultValue="SUPPORT_ADMIN" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent">{adminRoles.map((role) => <option key={role} value={role}>{getRoleLabel(role)}</option>)}</select><input type="password" name="password" placeholder="Temporary password (min 8 chars)" minLength={8} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" required /><button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">Save admin account</button></div>
                  </form>
                  <div className="space-y-4">{adminUsers.length ? adminUsers.map((item) => <div key={item.id} className="rounded-[1.5rem] border border-slate-200 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-lg font-semibold text-slate-950">{item.fullName}</div><div className="mt-1 text-sm text-slate-600">{item.email}</div></div><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getAdminStatusBadge(item.status)}`}>{item.status}</span></div><div className="mt-3 text-xs text-slate-500">Last login {formatTimestamp(item.lastLoginAt)} · Created {formatTimestamp(item.createdAt)}</div><form action={updateAdminUser} className="mt-4 grid gap-3 sm:grid-cols-2"><input type="hidden" name="adminUserId" value={item.id} /><label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role<select name="role" defaultValue={item.role} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">{adminRoles.map((role) => <option key={role} value={role}>{getRoleLabel(role)}</option>)}</select></label><label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status<select name="status" defaultValue={item.status} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">{adminUserStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label><div className="sm:col-span-2"><button type="submit" className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white">Save access</button></div></form></div>) : <div className="rounded-[1.5rem] border border-dashed border-slate-300 px-4 py-10 text-sm text-slate-500">No admin accounts found yet.</div>}</div>
                </div>
                <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-5"><div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><Clock3 className="h-4 w-4 text-accent" /> Recent audit log</div><div className="mt-4 space-y-3">{auditLogs.length ? auditLogs.map((item) => <div key={item.id} className="rounded-[1.25rem] bg-white px-4 py-4 text-sm text-slate-600"><div className="font-medium text-slate-950">{item.summary}</div><div className="mt-1 text-xs text-slate-500">{item.actor?.email || "System"} · {item.action} · {formatTimestamp(item.createdAt)}</div></div>) : <div className="rounded-[1.25rem] border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500">No audit events recorded yet.</div>}</div></div>
              </section>
            ) : null}

            {view === "analytics" ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Operations analytics</div>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-950">Track marketplace demand, conversion, supply quality, and team activity.</h2>
                  </div>
                  <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">Live admin summary</div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[1.5rem] bg-slate-50 p-5"><div className="text-xs uppercase tracking-wide text-slate-500">Quotes submitted</div><div className="mt-2 text-3xl font-semibold text-slate-950">{quoteSubmittedCount}</div><div className="mt-2 text-sm text-slate-600">Accepted {acceptedQuoteCount} · Rejected {rejectedQuoteCount}</div></div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-5"><div className="text-xs uppercase tracking-wide text-slate-500">Average quote value</div><div className="mt-2 text-3xl font-semibold text-slate-950">{formatCurrencyFromCents(averageQuoteValue)}</div><div className="mt-2 text-sm text-slate-600">Based on {quoteCount} stored quote{quoteCount === 1 ? "" : "s"}.</div></div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-5"><div className="text-xs uppercase tracking-wide text-slate-500">Verified supply</div><div className="mt-2 text-3xl font-semibold text-slate-950">{verifiedWorkshopCount}</div><div className="mt-2 text-sm text-slate-600">Mobile-enabled workshops: {mobileWorkshopCount}</div></div>
                  <div className="rounded-[1.5rem] bg-slate-50 p-5"><div className="text-xs uppercase tracking-wide text-slate-500">Admin activity</div><div className="mt-2 text-3xl font-semibold text-slate-950">{activeAdminCount}</div><div className="mt-2 text-sm text-slate-600">{recentAuditCount} audit event{recentAuditCount === 1 ? "" : "s"} in the last 24h.</div></div>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-3">
                  <div className="rounded-[1.5rem] border border-slate-200 p-5">
                    <div className="text-sm font-semibold text-slate-950">Lead outcomes</div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4"><div className="text-xs uppercase tracking-wide text-slate-500">Closed won</div><div className="mt-2 text-2xl font-semibold text-slate-950">{wonLeadCount}</div></div>
                      <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4"><div className="text-xs uppercase tracking-wide text-slate-500">Closed lost</div><div className="mt-2 text-2xl font-semibold text-slate-950">{lostLeadCount}</div></div>
                      <div className="rounded-[1.25rem] bg-slate-50 px-4 py-4"><div className="text-xs uppercase tracking-wide text-slate-500">Average workshop rating</div><div className="mt-2 text-2xl font-semibold text-slate-950">{averageWorkshopRating.toFixed(1)} ★</div></div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 p-5">
                    <div className="text-sm font-semibold text-slate-950">Top demand services</div>
                    <div className="mt-4 space-y-3">
                      {topDemandServices.length ? topDemandServices.map(([service, count]) => (
                        <div key={service} className="flex items-center justify-between rounded-[1.25rem] bg-slate-50 px-4 py-3 text-sm text-slate-700">
                          <span>{service}</span>
                          <span className="font-semibold text-slate-950">{count}</span>
                        </div>
                      )) : <div className="rounded-[1.25rem] border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500">No service demand data yet.</div>}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 p-5">
                    <div className="text-sm font-semibold text-slate-950">Top demand cities</div>
                    <div className="mt-4 space-y-3">
                      {topDemandCities.length ? topDemandCities.map(([city, count]) => (
                        <div key={city} className="flex items-center justify-between rounded-[1.25rem] bg-slate-50 px-4 py-3 text-sm text-slate-700">
                          <span>{city}</span>
                          <span className="font-semibold text-slate-950">{count}</span>
                        </div>
                      )) : <div className="rounded-[1.25rem] border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500">No city demand data yet.</div>}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.5rem] border border-slate-200 p-5">
                  <div className="text-sm font-semibold text-slate-950">Top rated workshops in current admin dataset</div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                    {topRatedWorkshops.length ? topRatedWorkshops.map((workshop) => (
                      <div key={workshop.id} className="rounded-[1.25rem] bg-slate-50 px-4 py-4 text-sm text-slate-700">
                        <div className="font-semibold text-slate-950">{workshop.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{workshop.city}, {workshop.province}</div>
                        <div className="mt-3 text-sm">{Number(workshop.ratingAverage).toFixed(1)} ★ · {workshop.reviewCount} review{workshop.reviewCount === 1 ? "" : "s"}</div>
                      </div>
                    )) : <div className="rounded-[1.25rem] border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500 lg:col-span-2 xl:col-span-3">No rated workshops available yet.</div>}
                  </div>
                </div>
              </section>
            ) : null}

            {view === "settings" ? (
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
                <div><div className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Rollout checklist</div><h2 className="mt-2 text-2xl font-semibold text-slate-950">Deployment and admin hardening notes for Railway.</h2></div>
                <div className="mt-6 grid gap-6 xl:grid-cols-2"><div className="rounded-[1.5rem] bg-slate-50 p-5"><div className="font-semibold text-slate-950">Environment variables</div><ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600"><li>Set DATABASE_URL and NEXT_PUBLIC_SITE_URL.</li><li>Set ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_FULL_NAME, and ADMIN_SESSION_SECRET for the primary super admin.</li><li>Run Prisma migrate deploy before starting the app.</li></ul></div><div className="rounded-[1.5rem] bg-slate-50 p-5"><div className="font-semibold text-slate-950">Recommended pre-deploy command</div><div className="mt-4 rounded-xl bg-slate-950 px-4 py-3 text-sm text-slate-100">npx prisma migrate deploy && npm run seed:real-data && npm run seed:super-admin</div><div className="mt-4 text-sm text-slate-600">This ensures the admin tables exist and the super-admin record is kept in sync with Railway variables.</div></div></div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
