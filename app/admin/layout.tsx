import Link from "next/link";
import { LayoutDashboard, Building2, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col bg-ink text-white lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <span className="text-lg font-bold text-fire">The Bonnet</span>
          <p className="mt-0.5 text-xs text-slate-400">Admin Console</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/workshops"
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Building2 className="h-4 w-4" />
            Workshops
          </Link>
        </nav>
        <div className="border-t border-white/10 p-3">
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
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
