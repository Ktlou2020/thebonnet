import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import {
  requireAdminUser,
  getRoleLabel,
  getRolePermissions,
  logAdminAction,
  hashAdminPassword,
  normalizeEmail,
} from "@/lib/admin-auth";
import type { AdminRole, AdminUserStatus } from "@prisma/client";
import { RolePermissionsPreview } from "./RolePermissionsPreview";

export const dynamic = "force-dynamic";

const permissionLabels: Record<string, string> = {
  viewDashboard: "View admin dashboard",
  manageLeads: "Manage customer leads",
  manageWorkshops: "Manage workshop listings",
  manageQuotes: "Manage quotes & pipeline",
  manageTrust: "Verify accreditations",
  manageAdminUsers: "Manage admin team",
  viewAnalytics: "View analytics & reports",
  manageSettings: "Access deployment settings",
};

const roleDescriptions: Record<AdminRole, string> = {
  SUPER_ADMIN:
    "Full unrestricted access to all admin functions. Reserved for founders and platform owners.",
  OPERATIONS_ADMIN:
    "Manages leads, workshops, quotes, trust and analytics. Ideal for ops managers.",
  SUPPORT_ADMIN:
    "Can view dashboard, manage leads and quotes. For customer support agents.",
  CONTENT_ADMIN:
    "Manages workshops, trust verification and can view analytics. For marketplace managers.",
  FINANCE_ADMIN:
    "Views quotes/pipeline and analytics. For finance and reporting roles.",
};

const roleAvatarBg: Record<AdminRole, string> = {
  SUPER_ADMIN: "bg-fire",
  OPERATIONS_ADMIN: "bg-violet-500",
  SUPPORT_ADMIN: "bg-sky-500",
  CONTENT_ADMIN: "bg-emerald-500",
  FINANCE_ADMIN: "bg-amber-500",
};

const statusBadge: Record<AdminUserStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  INVITED: "bg-amber-50 text-amber-700",
  DISABLED: "bg-slate-100 text-slate-500",
};

const allRoles: AdminRole[] = [
  "SUPER_ADMIN",
  "OPERATIONS_ADMIN",
  "SUPPORT_ADMIN",
  "CONTENT_ADMIN",
  "FINANCE_ADMIN",
];

const allStatuses: AdminUserStatus[] = ["ACTIVE", "INVITED", "DISABLED"];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function relativeTime(date: Date | null) {
  if (!date) return "Never";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-ZA");
}

async function createAdminUser(formData: FormData) {
  "use server";
  const admin = await requireAdminUser("manageAdminUsers");
  const prisma = getPrisma();
  if (!prisma) return;

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const role = String(formData.get("role") ?? "") as AdminRole;
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !role || !password) return;
  if (!allRoles.includes(role)) return;

  const passwordHash = await hashAdminPassword(password);

  await prisma.adminUser.upsert({
    where: { email },
    update: { fullName, role, passwordHash, status: "ACTIVE" },
    create: {
      email,
      fullName,
      role,
      passwordHash,
      status: "ACTIVE",
      invitedById: admin.id ?? undefined,
    },
  });

  await logAdminAction({
    actorId: admin.id,
    action: "admin_user.created",
    entityType: "admin_user",
    entityId: email,
    summary: `${admin.email} invited ${email} as ${getRoleLabel(role)}.`,
    metadata: { role, email },
  });

  revalidatePath("/admin/team");
}

async function updateAdminUser(formData: FormData) {
  "use server";
  const admin = await requireAdminUser("manageAdminUsers");
  const prisma = getPrisma();
  if (!prisma) return;

  const adminUserId = String(formData.get("adminUserId") ?? "").trim();
  const role = String(formData.get("role") ?? "") as AdminRole;
  const status = String(formData.get("status") ?? "") as AdminUserStatus;

  if (!adminUserId || !allRoles.includes(role) || !allStatuses.includes(status)) return;

  await prisma.adminUser.update({
    where: { id: adminUserId },
    data: { role, status },
  });

  await logAdminAction({
    actorId: admin.id,
    action: "admin_user.updated",
    entityType: "admin_user",
    entityId: adminUserId,
    summary: `${admin.email} updated admin user to role=${getRoleLabel(role)}, status=${status}.`,
    metadata: { role, status },
  });

  revalidatePath("/admin/team");
}

export default async function AdminTeamPage() {
  await requireAdminUser("manageAdminUsers");
  const prisma = getPrisma();

  const adminUsers = prisma
    ? await prisma.adminUser.findMany({
        include: { invitedBy: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const auditLogs = prisma
    ? await prisma.adminAuditLog.findMany({
        include: { actor: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  const totalAdmins = adminUsers.length;
  const activeAdmins = adminUsers.filter((u) => u.status === "ACTIVE").length;
  const uniqueRoles = new Set(adminUsers.map((u) => u.role)).size;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <div
        className="px-6 py-10 text-white lg:px-8"
        style={{
          background:
            "radial-gradient(circle at top,#1a3b6c,transparent 45%),linear-gradient(180deg,#08111f,#0b1730)",
        }}
      >
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Admin Team</h1>
          <p className="mt-1 text-sm text-slate-300">
            Manage who has access to the My Bonnet admin console and what they can do.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Total admins", value: totalAdmins },
            { label: "Active admins", value: activeAdmins },
            { label: "Roles in use", value: uniqueRoles },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft"
            >
              <p className="text-3xl font-bold text-slate-950">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Invite form */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-950">Invite admin user</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create a new admin account with a role and temporary password.
          </p>
          <form action={createAdminUser} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Full name
                <input
                  name="fullName"
                  required
                  placeholder="Jane Smith"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="jane@mybonnet.co.za"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <RolePermissionsPreview defaultRole="SUPPORT_ADMIN" />
              <label className="block text-sm font-medium text-slate-700">
                Temporary password
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  minLength={8}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90"
              >
                Create admin account
              </button>
            </div>
          </form>
        </div>

        {/* Role cards */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-slate-950">Role definitions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allRoles.map((role) => {
              const perms = getRolePermissions(role);
              return (
                <div
                  key={role}
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-soft"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${roleAvatarBg[role]}`}
                    >
                      {role.slice(0, 2)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{getRoleLabel(role)}</p>
                    </div>
                  </div>
                  <p className="mb-3 text-xs text-slate-500">{roleDescriptions[role]}</p>
                  <ul className="space-y-1">
                    {perms.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-xs text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {permissionLabels[p] ?? p}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team members table */}
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-soft overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-950">Team members</h2>
            <p className="text-sm text-slate-500 mt-0.5">{totalAdmins} admin account{totalAdmins === 1 ? "" : "s"}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">Role / Status</th>
                  <th className="px-5 py-3">Last login</th>
                  <th className="px-5 py-3">Invited by</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                      No admin users yet.
                    </td>
                  </tr>
                )}
                {adminUsers.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${roleAvatarBg[u.role]}`}
                        >
                          {initials(u.fullName)}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-950">{u.fullName}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                          {getRoleLabel(u.role)}
                        </span>
                        <br />
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[u.status]}`}
                        >
                          {u.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {relativeTime(u.lastLoginAt)}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {u.invitedBy?.fullName ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <form action={updateAdminUser} className="flex items-center gap-2">
                        <input type="hidden" name="adminUserId" value={u.id} />
                        <select
                          name="role"
                          defaultValue={u.role}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-accent"
                        >
                          {allRoles.map((r) => (
                            <option key={r} value={r}>
                              {getRoleLabel(r)}
                            </option>
                          ))}
                        </select>
                        <select
                          name="status"
                          defaultValue={u.status}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:ring-2 focus:ring-accent"
                        >
                          {allStatuses.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-ink/90"
                        >
                          Save
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit log */}
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-soft overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-950">Recent audit log</h2>
            <p className="text-sm text-slate-500 mt-0.5">Last 20 admin actions</p>
          </div>
          <div className="divide-y divide-slate-100">
            {auditLogs.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-slate-500">No audit entries yet.</p>
            )}
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 px-6 py-4">
                <div className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                  {initials(log.actor?.fullName ?? log.actorId ?? "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{log.summary}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    <span className="font-mono">{log.action}</span>
                    {" · "}
                    {relativeTime(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
