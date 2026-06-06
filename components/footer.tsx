import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 text-sm text-slate-400 lg:grid-cols-4 lg:px-8">
        <div>
          <h3 className="text-base font-semibold text-white">My Bonnet</h3>
          <p className="mt-3 leading-7">
            Real workshop listings, cleaner search, and a customer-first path to getting quotes from mechanics across South Africa.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white">Explore</h4>
          <ul className="mt-3 space-y-2">
            <li><Link href="/mechanics" className="transition hover:text-white">Find mechanics</Link></li>
            <li><Link href="/fair-price" className="transition hover:text-white">Fair Price Index beta</Link></li>
            <li><Link href="/request-quote" className="transition hover:text-white">Request a quote</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">For workshops</h4>
          <ul className="mt-3 space-y-2">
            <li><Link href="/for-mechanics" className="transition hover:text-white">Plans and pricing</Link></li>
            <li><Link href="/claim" className="transition hover:text-white">Claim your workshop</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">What&apos;s next</h4>
          <p className="mt-3 leading-7">
            The next product layers are richer quote routing, verified reviews, city landing pages, and later ecommerce for parts, tyres, and batteries.
          </p>
        </div>
      </div>
      <div className="border-t border-white/5 px-6 py-5 text-center text-xs text-slate-500">
        &copy; 2025 My Bonnet &middot; South Africa&apos;s mechanic marketplace
      </div>
    </footer>
  );
}
