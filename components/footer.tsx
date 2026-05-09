import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 text-sm text-slate-600 lg:grid-cols-4 lg:px-8">
        <div>
          <h3 className="text-base font-semibold text-slate-900">The Bonnet</h3>
          <p className="mt-3 leading-7">
            Verified mechanics, fair prices, and a scalable lead generation engine for South African workshops.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">Explore</h4>
          <ul className="mt-3 space-y-2">
            <li><Link href="/mechanics">Find mechanics</Link></li>
            <li><Link href="/fair-price">Fair Price Index</Link></li>
            <li><Link href="/request-quote">Request a quote</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">For workshops</h4>
          <ul className="mt-3 space-y-2">
            <li><Link href="/for-mechanics">Plans and ROI</Link></li>
            <li><Link href="/claim">Claim your workshop</Link></li>
            <li><Link href="/dashboard">Lead dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">Future layers</h4>
          <p className="mt-3 leading-7">
            Add parts commerce, tyres, batteries, fleet servicing, inspections, and roadside assistance without changing the core marketplace.
          </p>
        </div>
      </div>
    </footer>
  );
}
