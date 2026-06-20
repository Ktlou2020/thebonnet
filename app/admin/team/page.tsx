import { revalidatePath } from "next/cache";
import { Users, ShieldCheck, Clock3, Plus, Eye } from "lucide-react";
import {
  requireAdminUser,
  adminRoles,
  getRoleLabel,
  getRolePermissions,
  logAdminAction,
  hashAdminPassword,
  normalizeEmail,
  canAdminAccess,
  type AdminPermission,
} from "@/lib/admin-auth";
import { getPrisma } from "@/lib/db";
import type { AdminRole, AdminUserStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const adminUserStatuses = ["ACTIVE", "INVITED", "DISABLED"] as const satisfies Readonly<AdminUserStatus[]>;

const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Full unrestricted access to all admin functions. Reserved for founders and platform owners.",
  OPERATIONS_ADMIN: "Manages leads, workshops, quotes, trust and analytics. Ideal for ops managers.",
  SUPPORT_ADMIN: "Can view dashboard, manage leads and quotes. For customer support agents.",
  CONTENT_ADMIN: "Manages workshops, trust verification and can view analytics. For marketplace managers.",
  FINANCE_ADMIN: "Views quotes, pipeline and analytics. For finance and reporting roles.",
};

const PERMISSION_LABELS: Record<AdminPermission, string> = {
  viewDashboard: "View admin dashboard",
  manageLeads: "Manage customer leads",
  manageWorkshops: "Manage workshop listings",
  manageQuotes: "Manage quotes & pipeline",
  manageTrust: "Verify accreditations",
  manageAdminUsers: "Manage admin team",
  viewAnalytics: "View analytics & reports",
  manageSettings: "Access deployment settings",
};

const ROLE_COLORS: Record<AdminRole, string> = {
  SUPER_ADMIN: "bg-fire/10 text-fire",
  OPERATIONS_ADMIN: "bg-violet-50 text-violet-700",
  SUPPORT_ADMIN: "bg-sky-50 text-sky-700",
  CONTENT_ADMIN: "bg-emerald-50 text-emerald-700",
  FINANCE_ADMIN: "bg-amber-50 text-amber-700",
};

function getStatusBadge(status: AdminUserStatus) {
  switch (status) {
    case "ACTIVE": return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "INVITED": return "bg-amber-50 text-amber-700 ring-amber-200";
    case "DISABLED": return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function formatDate(d: Date | null) {
  if (!d) return "Never";
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
}

async function createTeamMember(formData: FormData) {
  "use server";
  const admin = await requireAdminUser("manageAdminUsers");
  const prisma = getPrisma();
  if (!prisma) return;

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const role = String(formData.get("role") ?? "SUPPORT_ADMIN") as AdminRole;
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || password.length < 8 || !adminRoles.includes(role)) return;

  const passwordHash = await hashAdminPassword(password);

  await prisma.adminUser.upsert({
    where: { email },
    update: { fullName, passwordHash, role, status: "ACTIVE", invitedById: admin.id ?? undefined },
    create: { fullName, email, passwordHash, role, status: "ACTIVE", invitedById: admin.id ?? undefined },
  });

  await prisma.profile.upsert({
    where: { email },
    update: { fullName },
    create: { email, fullName },
  });

  await logAdminAction({
    actorId: admin.id,
    action: "admin_user.created",
    entityType: "admin_user",
    entityId: email,
    summary: `${admin.email} created admin account for ${email} with role ${role}.`,
    metadata: { role },
  });

  revalidatePath("/admin/team");
}

async function updateTeamMember(formData: FormData) {
  "use server";
  const admin = await requireAdminUser("manageAdminUsers");
  const prisma = getPrisma();
  if (!prisma) return;

  const adminUserId = String(formData.get("adminUserId") ?? "");
  const role = String(formData.get("role") ?? "") as AdminRole;
  const status = String(formData.get("status") ?? "") as AdminUserStatus;

  if (!adminUserId || !adminRoles.includes(role) || !adminUserStatuses.includes(status)) return;
  if (admin.id && admin.id === adminUserId && status === "DISABLED") return;

  await prisma.adminUser.update({ where: { id: adminUserId }, data: { role, status } });

  await logAdminAction({
    actorId: admin.id,
    action: "admin_user.updated",
    entityType: "admin_user",
    entityId: adminUserId,
    summary: `${admin.email} updated admin account — role: ${role}, status: ${status}.`,
    metadata: { role, status },
  });

  revalidatePath("/admin/team");
}

export default async function AdminTeamPage() {
  const admin = await requireAdminUser("manageAdminUsers");
  const prisma = getPrisma();

  const [teamMembers, auditLogs] = prisma
    ? await Promise.all([
        prisma.adminUser.findMany({ include: { invitedBy: true }, orderBy: { createdAt: "desc" } }),
        prisma.adminAuditLog.findMany({ include: { actor: true }, orderBy: { createdAt: "desc" }, take: 20 }),
      ])
    : [[], []];

  const activeCount = teamMembers.filter((m) => m.status === "ACTIVE").length;
  const recentCount = teamMembers.filter((m) => m.lastLoginAt && Date.now() - m.lastLoginAt.getTime() < 7 * 24 * 3600 * 1000).length;
  const rolesInUse = new Set(teamMembers.map((m) => m.role)).size;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-ink px-6 py-10 text-white lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 mb-4">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Admin team management
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">Admin Team</h1>
          <p className="mt-2 text-slate-300 text-sm leading-7 max-w-2xl">
            Manage who has access to the admin console, assign roles, and review access activity.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-6 sm:w-fit">
            <div><div className="text-3xl font-bold text-fire">{activeCount}</div><div className="mt-1 text-xs text-slate-400">Active members</div></div>
            <div><div className="text-3xl font-bold text-fire">{recentCount}</div><div className="mt-1 text-xs text-slate-400">Active this week</div></div>
            <div><div className="text-3xl font-bold text-fire">{rolesInUse}</div><div className="mt-1 text-xs text-slate-400">Roles in use</div></div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8 space-y-8">
        <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
          {/* Left: Team list + audit */}
          <div className="space-y-6">
            {/* Team members */}
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Team members</h2>
                  <p className="text-sm text-slate-500 mt-1">{teamMembers.length} admin account{teamMembers.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-500">{activeCount} active</span>
                </div>
              </div>

              {teamMembers.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-200 py-12 text-center">
                  <Users className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No team members yet. Add one using the form.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="rounded-[1.5rem] border border-slate-200 p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${ROLE_COLORS[member.role]}`}>
                            {(member.fullName[0] ?? "?").toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{member.fullName}</div>
                            <div className="text-xs text-slate-500">{member.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLORS[member.role]}`}>
                            {getRoleLabel(member.role)}
                          </span>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${getStatusBadge(member.status)}`}>
                            {member.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>Last login: {formatDate(member.lastLoginAt)}</span>
                        <span>Joined: {formatDate(member.createdAt)}</span>
                        {member.invitedBy && <span>Invited by: {member.invitedBy.fullName}</span>}
                      </div>

                      {canAdminAccess(admin.role, "manageAdminUsers") && (
                        <form action={updateTeamMember} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] items-end">
                          <input type="hidden" name="adminUserId" value={member.id} />
                          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Role
                            <select name="role" defaultValue={member.role} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-accent">
                              {adminRoles.map((r) => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
                            </select>
                          </label>
                          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Status
                            <select name="status" defaultValue={member.status} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-accent">
                              {adminUserStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </label>
                          <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-bonnet transition">
                            Save
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Audit log */}
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-5">
                <Clock3 className="h-4 w-4 text-accent" />
                <h2 className="text-lg font-bold text-slate-950">Recent audit log</h2>
              </div>
              {auditLogs.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">No audit events recorded yet.</div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="rounded-[1.25rem] bg-slate-50 px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">{log.summary}</div>
                      <div className="mt-1 flex gap-3 text-xs text-slate-500">
                        <span>{log.actor?.email ?? "System"}</span>
                        <span>·</span>
                        <span>{log.action}</span>
                        <span>·</span>
                        <span>{formatDate(log.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right: Invite form + role cards */}
          <div className="space-y-6">
            {/* Invite form */}
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-5">
                <Plus className="h-4 w-4 text-fire" />
                <h2 className="text-lg font-bold text-slate-950">Add team member</h2>
              </div>
              <form action={createTeamMember} className="space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Full name
                  <input name="fullName" required placeholder="e.g. Kagiso Sithole" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Email address
                  <input name="email" type="email" required placeholder="name@thebonnet.co.za" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Role
                  <select name="role" defaultValue="SUPPORT_ADMIN" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent">
                    {adminRoles.map((r) => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Temporary password
                  <input name="password" type="password" required minLength={8} placeholder="Min. 8 characters" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
                </label>
                <button type="submit" className="w-full rounded-full bg-fire px-5 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90">
                  Add team member
                </button>
              </form>
            </section>

            {/* Role reference cards */}
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-5">
                <Eye className="h-4 w-4 text-accent" />
                <h2 className="text-lg font-bold text-slate-950">Role reference</h2>
              </div>
              <div className="space-y-3">
                {adminRoles.map((role) => {
                  const perms = getRolePermissions(role);
                  return (
                    <details key={role} className="group rounded-[1.25rem] border border-slate-200 bg-slate-50">
                      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 list-none">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${ROLE_COLORS[role]}`}>{getRoleLabel(role)}</span>
                        </div>
                        <span className="text-xs text-slate-500">{perms.length} permissions</span>
                      </summary>
                      <div className="border-t border-slate-200 px-4 py-3">
                        <p className="text-xs text-slate-600 mb-3">{ROLE_DESCRIPTIONS[role]}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {perms.map((p) => (
                            <span key={p} className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-xs text-slate-700">
                              {PERMISSION_LABELS[p]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
