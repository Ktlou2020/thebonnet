import { RecommendForm } from "@/components/recommend-form";
import { getCityHighlights } from "@/lib/workshops";
import { SERVICE_AREAS } from "@/lib/areas";

export const dynamic = "force-dynamic";

export default async function RecommendPage() {
  let cities: string[] = [...SERVICE_AREAS];
  try {
    const highlights = await getCityHighlights();
    if (highlights.length) cities = Array.from(new Set([...highlights.map((c) => c.city), ...SERVICE_AREAS]));
  } catch { /* fall back to defaults */ }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ink px-6 py-12 text-white lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Know a great workshop?</h1>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Nominate a mechanic you trust. We&apos;ll review and add them to My Bonnet — and you&apos;ll earn 150 XP for helping the community.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
        <RecommendForm cities={cities} />
      </div>
    </div>
  );
}
