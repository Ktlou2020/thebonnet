import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 text-sm text-slate-600 lg:grid-cols-4 lg:px-8">
        <div>
          <h3 className="text-base font-semibold text-slate-900">The Bonnet</h3>
          <p className="mt-3 leading-7">
            Real workshop listings, cleaner search, and a customer-first path to getting quotes from mechanics across South Africa.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">Explore</h4>
          <ul className="mt-3 space-y-2">
            <li><Link href="/mechanics">Find mechanics</Link></li>
            <li><Link href="/fair-price">Fair Price Index beta</Link></li>
            <li><Link href="/request-quote">Request a quote</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">For workshops</h4>
          <ul className="mt-3 space-y-2">
            <li><Link href="/for-mechanics">Plans and pricing</Link></li>
            <li><Link href="/claim">Claim your workshop</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">What&apos;s next</h4>
          <p className="mt-3 leading-7">
            The next product layers are richer quote routing, verified reviews, city landing pages, and later ecommerce for parts, tyres, and batteries.
          </p>
        </div>
      </div>
    </footer>
  );
}
