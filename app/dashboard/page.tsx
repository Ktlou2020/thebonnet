import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { DashboardLeads } from "./dashboard-leads";
import { DashboardReviews } from "./dashboard-reviews";
import { DashboardSettings } from "./dashboard-settings";
import { ProfileScoreCard } from "@/components/profile-score-card";

type TabName = "leads" | "reviews" | "settings";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const params = (await searchParams) ?? {};
  const tab = (params.tab as TabName) || "leads";

  // Find workshop for this user
  let workshop: {
    id: string;
    name: string;
    slug: string;
    city: string;
    phone: string | null;
    description: string;
    imageUrl?: string | null;
    openingHours?: unknown;
    whatsapp?: string | null;
    listingTypes?: string[];
    isVerified?: boolean;
    addressLine1?: string | null;
  } | null = null;

  try {
    const profile = await db.profile.findUnique({ where: { email: session.user.email } });
    if (profile) {
      workshop = await db.workshop.findFirst({
        where: { ownerId: profile.id },
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          phone: true,
          description: true,
          openingHours: true,
          whatsapp: true,
          listingTypes: true,
          isVerified: true,
          addressLine1: true,
        },
      });
    }
  } catch {
    // DB unavailable
  }

  if (!workshop) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-ink text-white px-6 py-10 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold">Workshop Dashboard</h1>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-slate-900">No workshop found</h2>
          <p className="mt-3 text-slate-500 text-sm">You don&apos;t have a workshop linked to your account yet.</p>
          <Link
            href="/claim"
            className="mt-6 inline-flex rounded-full bg-fire px-6 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
          >
            Set up your workshop
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: TabName; label: string }[] = [
    { id: "leads", label: "Leads" },
    { id: "reviews", label: "Reviews" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ink text-white px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">{workshop.name}</h1>
          <p className="mt-1 text-slate-300 text-sm">Workshop dashboard · {workshop.city}</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mt-8">
          <ProfileScoreCard workshop={workshop} />
        </div>

        {/* Setup checklist */}
        {(() => {
          const checks = [
            { label: "Phone number", done: !!workshop.phone },
            { label: "Address", done: !!workshop.addressLine1 },
            { label: "Service types", done: (workshop.listingTypes?.length ?? 0) > 0 },
            { label: "Opening hours", done: !!workshop.openingHours },
          ];
          const allDone = checks.every((c) => c.done);
          if (allDone) return null;
          return (
            <div className="mt-6 rounded-[2rem] border border-fire/20 bg-fire/5 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Complete your profile</h2>
              <ul className="space-y-2">
                {checks.map((c) => (
                  <li key={c.label} className="flex items-center justify-between text-sm">
                    <span className={`flex items-center gap-2 ${c.done ? "text-slate-400 line-through" : "text-slate-700"}`}>
                      {c.done ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 text-xs font-bold">✓</span>
                      ) : (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-fire/10 text-fire text-xs font-bold">→</span>
                      )}
                      {c.label}
                    </span>
                    {!c.done && (
                      <Link href="/dashboard?tab=settings" className="text-xs font-semibold text-fire hover:underline">
                        Add →
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        {/* Tab nav */}
        <div className="mt-6 flex gap-1 border-b border-slate-200">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard?tab=${t.id}`}
              className={`px-5 py-3 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? "border-b-2 border-fire text-fire"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="py-8">
          {tab === "leads" && <DashboardLeads workshopId={workshop.id} workshopName={workshop.name} />}
          {tab === "reviews" && <DashboardReviews workshopId={workshop.id} />}
          {tab === "settings" && <DashboardSettings workshop={workshop} />}
        </div>
      </div>
    </div>
  );
}
