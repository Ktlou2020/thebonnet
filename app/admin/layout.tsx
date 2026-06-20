"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Building2, LogOut, Star, Inbox, Users,
  BarChart3, CreditCard, ShieldCheck, Menu, X
} from "lucide-react";

const navLinks = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", Icon: Inbox },
  { href: "/admin/workshops", label: "Workshops", Icon: Building2 },
  { href: "/admin/reviews", label: "Reviews", Icon: Star },
  { href: "/admin/users", label: "Platform Users", Icon: Users },
  { href: "/admin/team", label: "Admin Team", Icon: ShieldCheck },
  { href: "/admin/subscriptions", label: "Subscriptions", Icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
];

type AdminInfo = { email: string; fullName: string; roleLabel: string } | null;

function SidebarContent({ pathname, adminInfo }: { pathname: string; adminInfo: AdminInfo }) {
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <span className="text-lg font-bold text-fire">My Bonnet</span>
        <p className="mt-0.5 text-xs text-slate-400">Admin Console</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {navLinks.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
              isActive(href)
                ? "bg-white/15 text-white"
                : "text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
            {isActive(href) && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-fire" />
            )}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3 space-y-1">
        {adminInfo && (
          <div className="rounded-2xl bg-white/5 px-3 py-3 mb-1">
            <div className="text-xs font-semibold text-white truncate">{adminInfo.fullName}</div>
            <div className="text-xs text-slate-400 truncate">{adminInfo.roleLabel}</div>
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
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState<AdminInfo>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => { if (d.admin) setAdminInfo(d.admin); })
      .catch(() => {});
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col bg-ink text-white lg:flex">
        <SidebarContent pathname={pathname} adminInfo={adminInfo} />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-ink text-white transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent pathname={pathname} adminInfo={adminInfo} />
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-sm font-semibold text-slate-900">My Bonnet Admin</span>
        </div>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
