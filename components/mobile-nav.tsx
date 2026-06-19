"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, Home, MessageSquare, Search, User } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/mechanics", label: "Find", icon: Search },
  { href: "/garage", label: "Garage", icon: Car },
  { href: "/quotes", label: "Quotes", icon: MessageSquare },
  { href: "/dashboard", label: "Account", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-ink pb-safe md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-2xl px-3 py-2 text-[10px] font-medium transition ${
                active ? "text-fire" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-fire" : ""}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
