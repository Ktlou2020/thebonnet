import { SectionHeading } from "@/components/section-heading";

export default function ClaimPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
      <SectionHeading
        eyebrow="Supply onboarding"
        title="Claim your workshop"
        description="This page is set up for a future multi-step onboarding flow: business verification, address proof, workshop media, accreditations, categories, and payment setup."
      />
      <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <input placeholder="Workshop name" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" />
          <input placeholder="Owner name" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" />
          <input placeholder="Business email" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" />
          <input placeholder="WhatsApp number" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" />
          <input placeholder="Province" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" />
          <input placeholder="City / suburb" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <textarea placeholder="What services do you offer? Which brands do you specialize in?" rows={5} className="mt-4 w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" />
        <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-5 text-sm leading-7 text-slate-600">
          Next implementation steps: upload registration docs, verify MIWA/RMI numbers, connect Stripe or Paystack, and create moderation status workflows.
        </div>
      </div>
    </div>
  );
}
