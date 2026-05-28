"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPinned, Menu, X } from "lucide-react";
import { useState } from "react";

const nav = [
  { href: "/mechanics", label: "Directory" },
  { href: "/fair-price", label: "Pricing beta" },
  { href: "/for-mechanics", label: "For mechanics" }
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white" onClick={() => setOpen(false)}>
          <div className="rounded-2xl bg-white p-1.5 shadow-soft">
            <Image src="/brand/the-bonnet-logo.png" alt="The Bonnet" width={44} height={44} className="h-11 w-11 object-contain" priority />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">The Bonnet</div>
            <div className="text-xs text-slate-400">South Africa&apos;s mechanic marketplace</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/mechanics" className="hidden rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:border-white/30 sm:inline-flex">
            <MapPinned className="mr-2 h-4 w-4" />
            Browse cities
          </Link>
          <Link href="/request-quote" className="rounded-full bg-fire px-4 py-2 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90">
            Get quotes
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-xl border border-white/10 p-2 text-white transition hover:bg-white/5 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-ink/95 px-6 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col gap-4 text-sm text-slate-200">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
            <Link href="/mechanics" onClick={() => setOpen(false)} className="mt-2 flex items-center gap-2 text-slate-300 transition hover:text-white">
              <MapPinned className="h-4 w-4" />
              Browse cities
            </Link>
            <Link href="/request-quote" onClick={() => setOpen(false)} className="mt-2 inline-flex w-fit rounded-full bg-fire px-5 py-2.5 text-sm font-semibold text-white">
              Get quotes
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
