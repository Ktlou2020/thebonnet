"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  LogOut,
  Star,
  Inbox,
  Users,
  BarChart3,
  CreditCard,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

const navLinks = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/leads", label: "Leads", Icon: Inbox, exact: false },
  { href: "/admin/workshops", label: "Workshops", Icon: Building2, exact: false },
  { href: "/admin/reviews", label: "Reviews", Icon: Star, exact: false },
  { href: "/admin/users", label: "Platform Users", Icon: Users, exact: false },
  { href: "/admin/team", label: "Admin Team", Icon: ShieldCheck, exact: false },
  { href: "/admin/subscriptions", label: "Subscriptions", Icon: CreditCard, exact: false },
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3, exact: false },
];

interface AdminMe {
  email: string;
  fullName: string;
  roleLabel: string;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<AdminMe | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((data: { admin: AdminMe | null }) => {
        if (data.admin) setAdminUser(data.admin);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-full flex-col bg-ink text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <div>
          <span className="text-lg font-bold text-fire">My Bonnet</span>
          <p className="mt-0.5 text-xs text-slate-400">Admin Console</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {navLinks.map(({ href, label, Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        {adminUser && (
          <div className="mb-2 rounded-2xl px-3 py-2">
            <p className="truncate text-xs font-semibold text-white">{adminUser.fullName}</p>
            <p className="mt-0.5 text-xs text-slate-400">{adminUser.roleLabel}</p>
          </div>
        )}
        <form action="/api/admin/logout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 w-64 shrink-0">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 bg-ink px-4 py-3 text-white lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-xl p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold text-fire">My Bonnet Admin</span>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
