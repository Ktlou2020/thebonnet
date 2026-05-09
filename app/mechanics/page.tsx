import { MechanicCard } from "@/components/mechanic-card";
import { SectionHeading } from "@/components/section-heading";
import { mechanics, serviceCategories } from "@/lib/data";

export default function MechanicsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <SectionHeading
        eyebrow="Marketplace"
        title="Find mechanics by city, specialty, and trust signals"
        description="This search page is prebuilt for province filters, make-model pages, and future map integration. In production, connect these cards to a database and geospatial queries."
      />

      <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="grid gap-4 lg:grid-cols-4">
          <input placeholder="Search city, suburb, or mechanic" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent" />
          <select className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent">
            <option>All provinces</option>
            <option>Gauteng</option>
            <option>Western Cape</option>
            <option>KwaZulu-Natal</option>
            <option>Eastern Cape</option>
          </select>
          <select className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent">
            <option>All vehicle makes</option>
            <option>Toyota</option>
            <option>Volkswagen</option>
            <option>Ford</option>
            <option>BMW</option>
            <option>Tesla</option>
          </select>
          <select className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-accent">
            <option>Sort by response speed</option>
            <option>Highest rating</option>
            <option>Lowest price</option>
            <option>Nearest</option>
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {serviceCategories.map((service) => (
            <span key={service} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {service}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {mechanics.map((mechanic) => (
          <MechanicCard key={mechanic.id} mechanic={mechanic} />
        ))}
      </div>
    </div>
  );
}
