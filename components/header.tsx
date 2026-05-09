import Link from "next/link";
import { Wrench, MapPinned } from "lucide-react";

const nav = [
  { href: "/mechanics", label: "Mechanics" },
  { href: "/fair-price", label: "Fair Price Index" },
  { href: "/for-mechanics", label: "For Mechanics" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin", label: "Admin" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white">
          <div className="rounded-2xl bg-accent/20 p-2 text-accent">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">The Bonnet</div>
            <div className="text-xs text-slate-300">South Africa&apos;s mechanic marketplace</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/mechanics"
            className="hidden rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:border-white/30 sm:inline-flex"
          >
            <MapPinned className="mr-2 h-4 w-4" />
            Near me
          </Link>
          <Link href="/request-quote" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-ink transition hover:bg-accent/90">
            Get quotes
          </Link>
        </div>
      </div>
    </header>
  );
}
