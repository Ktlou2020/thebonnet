"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export function AuthButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (status === "loading") {
    return <div className="h-8 w-20 animate-pulse rounded-full bg-white/10" />;
  }

  if (status === "unauthenticated") {
    return (
      <Link href="/login" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/40 hover:bg-white/5">
        Sign in
      </Link>
    );
  }

  const initial = (session?.user?.name ?? session?.user?.email ?? "?")[0].toUpperCase();
  const isWorkshop = (session?.user as { role?: string })?.role === "WORKSHOP_OWNER";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-fire text-sm font-bold text-white"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 min-w-48 rounded-2xl border border-white/10 bg-ink p-2 shadow-lg">
          <div className="px-3 py-2 border-b border-white/10 mb-1">
            <div className="text-sm font-semibold text-white truncate">{session?.user?.name ?? session?.user?.email}</div>
            <div className="text-xs text-slate-500">{isWorkshop ? "Workshop" : "Driver"}</div>
          </div>
          {isWorkshop ? (
            <Link href="/dashboard" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition">Dashboard</Link>
          ) : (
            <Link href="/garage" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white transition">My Garage</Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-white/5 transition"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
