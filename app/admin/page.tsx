const queues = [
  { title: "New workshop claims", count: 18, note: "Awaiting business registration and WhatsApp verification" },
  { title: "Accreditation checks", count: 9, note: "Verify MIWA / RMI numbers against provider submissions" },
  { title: "Review disputes", count: 4, note: "Potential moderation and fraud review" },
  { title: "Price anomalies", count: 7, note: "Benchmark outliers flagged for manual validation" }
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Trust operations</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Admin controls for a credible marketplace</h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-600">
          The original platform&apos;s biggest weakness was data credibility. This admin view makes verification, moderation, and pricing QA visible as first-class product capabilities.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {queues.map((item) => (
          <div key={item.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm text-slate-500">{item.title}</p>
            <p className="mt-3 text-4xl font-semibold text-slate-950">{item.count}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
