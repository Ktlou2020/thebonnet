import Link from "next/link";
import { ShieldCheck, Star, TrendingUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink">
      {/* Social proof strip */}
      <div className="border-b border-white/5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 py-8 text-sm text-slate-300 lg:px-8">
          <span className="inline-flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /> 10,000+ drivers</span>
          <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> 500+ verified workshops</span>
          <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 fill-gold text-gold" /> 4.8★ average rating</span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 text-sm text-slate-400 lg:grid-cols-4 lg:px-8">
        <div>
          <h3 className="text-base font-semibold text-white">My Bonnet</h3>
          <p className="mt-3 leading-7">
            South Africa&apos;s mechanic marketplace. Find trusted workshops, compare quotes, and track every service in one place.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white">For drivers</h4>
          <ul className="mt-3 space-y-2">
            <li><Link href="/mechanics" className="transition hover:text-white">Find mechanics</Link></li>
            <li><Link href="/request-quote" className="transition hover:text-white">Request a quote</Link></li>
            <li><Link href="/garage" className="transition hover:text-white">My Garage</Link></li>
            <li><Link href="/ai-diagnose" className="transition hover:text-white">AI Diagnose</Link></li>
            <li><Link href="/recommend" className="transition hover:text-white">Recommend a workshop</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">For workshops</h4>
          <ul className="mt-3 space-y-2">
            <li><Link href="/for-mechanics" className="transition hover:text-white">Plans and pricing</Link></li>
            <li><Link href="/claim" className="transition hover:text-white">Claim your workshop</Link></li>
            <li><Link href="/dashboard" className="transition hover:text-white">Workshop dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Company</h4>
          <ul className="mt-3 space-y-2">
            <li><Link href="/fair-price" className="transition hover:text-white">Fair Price Index</Link></li>
            <li><Link href="/driver" className="transition hover:text-white">My Account & Rewards</Link></li>
            <li><Link href="/login" className="transition hover:text-white">Sign in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 px-6 py-5 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} My Bonnet &middot; South Africa&apos;s mechanic marketplace
      </div>
    </footer>
  );
}
