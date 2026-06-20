"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

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

const rolePermissions: Record<string, string[]> = {
  SUPER_ADMIN: [
    "viewDashboard",
    "manageLeads",
    "manageWorkshops",
    "manageQuotes",
    "manageTrust",
    "manageAdminUsers",
    "viewAnalytics",
    "manageSettings",
  ],
  OPERATIONS_ADMIN: [
    "viewDashboard",
    "manageLeads",
    "manageWorkshops",
    "manageQuotes",
    "manageTrust",
    "viewAnalytics",
  ],
  SUPPORT_ADMIN: ["viewDashboard", "manageLeads", "manageQuotes"],
  CONTENT_ADMIN: ["viewDashboard", "manageWorkshops", "manageTrust", "viewAnalytics"],
  FINANCE_ADMIN: ["viewDashboard", "manageQuotes", "viewAnalytics"],
};

export function RolePermissionsPreview({ defaultRole }: { defaultRole: string }) {
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const perms = rolePermissions[selectedRole] ?? [];

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Role
          <select
            name="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
          >
            {Object.keys(rolePermissions).map((r) => (
              <option key={r} value={r}>
                {r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
        </label>
      </div>

      {perms.length > 0 && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Permissions granted
          </p>
          <ul className="space-y-1">
            {perms.map((p) => (
              <li key={p} className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {permissionLabels[p] ?? p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
