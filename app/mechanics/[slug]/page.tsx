import { notFound } from "next/navigation";
import Link from "next/link";
import { Globe, MapPin, PhoneCall, ShieldCheck, Star } from "lucide-react";
import { getMechanicBySlug, getRelatedMechanics } from "@/lib/workshops";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { ReviewCard } from "@/components/review-card";
import { ReviewForm } from "@/components/review-form";
import { WorkshopSchema } from "@/components/workshop-schema";
import { OpeningHours } from "@/components/opening-hours";
import { ProfileTabs } from "@/components/profile-tabs";
import { WorkshopBadges } from "@/components/workshop-badges";
import { WorkshopCard } from "@/components/workshop-card";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mechanic = await getMechanicBySlug(slug);
  if (!mechanic) return {};
  return {
    title: `${mechanic.name} — Workshop in ${mechanic.city}`,
    description: `${mechanic.name} is a mechanic workshop in ${mechanic.city}, ${mechanic.province}. Services: ${mechanic.services.join(", ")}.`,
  };
}

type ReviewRow = {
  id: string;
  authorName: string;
  rating: number;
  body: string | null;
  jobType: string | null;
  costCents: number | null;
  helpfulCount: number;
  reply: string | null;
  repliedAt: Date | null;
  receiptVerified: boolean;
  createdAt: Date;
};

export default async function MechanicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [mechanic, session] = await Promise.all([getMechanicBySlug(slug), auth()]);

  if (!mechanic) notFound();

  const related = await getRelatedMechanics(mechanic, 3);
  const telHref = mechanic.phone ? `tel:${mechanic.phone.replace(/\s+/g, "")}` : null;
  const quoteHref = `/request-quote?${new URLSearchParams({ city: mechanic.city, service: mechanic.services[0] ?? "General Service" }).toString()}`;

  let reviews: ReviewRow[] = [];
  let workshopOpeningHours: Record<string, string | null> | null = null;
  let workshopClaimedByProfileId: string | null = null;
  let workshopOwnerId: string | null = null;
  let workshopWhatsapp: string | null = null;
  try {
    const workshop = await db.workshop.findUnique({
      where: { slug },
      select: { id: true, openingHours: true, claimedByProfileId: true, ownerId: true, whatsapp: true },
    });
    if (workshop) {
      workshopOpeningHours = workshop.openingHours as Record<string, string | null> | null;
      workshopClaimedByProfileId = workshop.claimedByProfileId ?? null;
      workshopOwnerId = workshop.ownerId ?? null;
      workshopWhatsapp = workshop.whatsapp ?? null;
      reviews = await db.$queryRaw<ReviewRow[]>`
        SELECT id, "authorName", rating, body, "jobType", "costCents", "helpfulCount", reply, "repliedAt", "receiptVerified", "createdAt"
        FROM reviews
        WHERE "workshopId" = ${workshop.id}::uuid AND status = 'APPROVED'
        ORDER BY "createdAt" DESC
      `;
    }
  } catch {
    // DB unavailable — show empty list
  }

  const isOwner = !!(session?.user?.id && workshopOwnerId && session.user.id === workshopOwnerId);

  // Derive workshop performance badges
  const badges: string[] = [];
  if (mechanic.isVerified) badges.push("verified");
  if (mechanic.rating >= 4.8) badges.push("top_rated");
  if (mechanic.responseTimeLabel && /(\d+)m|within 1h/.test(mechanic.responseTimeLabel)) badges.push("fast_responder");
  if ((mechanic.reviewCount ?? 0) >= 10) badges.push("community_pick");

  const mapsQuery = encodeURIComponent(`${mechanic.name}, ${mechanic.city}, South Africa`);

  const overviewTab = (
    <div className="space-y-8">
      <div className="rounded-[1.5rem] bg-slate-50 p-5">
        <h2 className="text-lg font-semibold text-slate-950">Opening hours</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{mechanic.hours}</p>
        <OpeningHours hours={workshopOpeningHours} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-slate-950">Service categories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {mechanic.services.map((service) => <span key={service} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">{service}</span>)}
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-slate-950">Workshop profile</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {mechanic.types.map((type) => <span key={type} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">{type}</span>)}
          </div>
        </div>
      </div>
      <iframe
        src={`https://maps.google.com/maps?q=${mapsQuery}&output=embed`}
        className="h-64 w-full rounded-2xl border border-slate-200"
        loading="lazy"
        title={`${mechanic.name} location`}
      />
    </div>
  );

  const reviewsTab = (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-950">Customer reviews</h2>
        {reviews.length > 0 && <span className="text-sm text-slate-500">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>}
      </div>
      {reviews.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={{ ...r, repliedAt: r.repliedAt ? r.repliedAt.toISOString() : null, createdAt: r.createdAt.toISOString() }}
            />
          ))}
        </div>
      )}
      {session ? (
        <div className="mt-6"><ReviewForm workshopSlug={mechanic.slug} /></div>
      ) : (
        <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-soft">
          <p className="text-sm text-slate-600">
            <Link href="/login" className="font-semibold text-fire hover:underline">Sign in</Link> to leave a review and earn 100 XP.
          </p>
        </div>
      )}
    </div>
  );

  const galleryTab = (
    <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-400">
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M1.5 18.75h21M6.75 5.25a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z" /></svg>
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-700">No photos yet</h3>
      <p className="mt-2 text-sm text-slate-500">
        {isOwner
          ? "Add photos of your workshop to build trust with potential customers."
          : "This workshop hasn't added photos yet."}
      </p>
      {isOwner && (
        <a href="/dashboard?tab=settings" className="mt-5 inline-flex rounded-full bg-fire px-5 py-2.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90">
          Upload photos →
        </a>
      )}
    </div>
  );

  const aboutTab = (
    <div className="space-y-4 text-sm leading-7 text-slate-600">
      <p>
        {mechanic.name} is a mechanic workshop based in {mechanic.city}, {mechanic.province}. This profile is part of the My Bonnet
        directory and is designed to make workshop discovery clearer, more trustworthy, and more useful for drivers.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-400">Source</div><div className="font-semibold text-slate-900">{mechanic.source}</div></div>
        <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-400">Mobile service</div><div className="font-semibold text-slate-900">{mechanic.mobile ? "Yes" : "No"}</div></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <WorkshopSchema mechanic={mechanic} />
      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-br from-ink via-bonnet to-ink sm:h-64">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(circle_at_30%_40%,#f97316,transparent_40%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="-mt-16 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          {isOwner && (
            <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-accent/20 bg-accent/10 px-5 py-3 text-sm text-teal-800">
              <span>This is your listing</span>
              <Link href="/dashboard?tab=settings" className="shrink-0 font-semibold text-accent hover:underline">Edit in dashboard →</Link>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {mechanic.featured && <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-amber-700">Featured</span>}
            {mechanic.mobile && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Mobile support</span>}
            {mechanic.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-teal-700">
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{mechanic.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-fire" />{mechanic.city}, {mechanic.province}</span>
            <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 fill-gold text-gold" />{mechanic.rating.toFixed(1)} rating{mechanic.reviewCount ? ` · ${mechanic.reviewCount} reviews` : ""}</span>
            {mechanic.responseTimeLabel && <span>{mechanic.responseTimeLabel}</span>}
          </div>
          {badges.length > 0 && <div className="mt-4"><WorkshopBadges badges={badges} /></div>}
        </div>

        <div className="grid gap-8 py-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white px-6 shadow-soft sm:px-8">
            <ProfileTabs
              tabs={[
                { id: "overview", label: "Overview", content: overviewTab },
                { id: "reviews", label: `Reviews${reviews.length ? ` (${reviews.length})` : ""}`, content: reviewsTab },
                { id: "gallery", label: "Gallery", content: galleryTab },
                { id: "about", label: "About", content: aboutTab },
              ]}
            />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-accent">Contact this workshop</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">Send one quote request through My Bonnet, or reach out directly using the details below.</p>
              <div className="mt-5 flex flex-col gap-3">
                <Link href={quoteHref} className="rounded-full bg-fire px-4 py-3 text-center text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90">Get a free quote</Link>
                {workshopWhatsapp && (
                  <a href={`https://wa.me/${workshopWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I found ${mechanic.name} on My Bonnet and I'd like to enquire about a service.`)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    WhatsApp workshop
                  </a>
                )}
                {telHref && <a href={telHref} className="flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"><PhoneCall className="h-4 w-4" />Call workshop</a>}
                {mechanic.website && <a href={mechanic.website} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"><Globe className="h-4 w-4" />Visit website</a>}
              </div>
            </div>

            {!workshopClaimedByProfileId && (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-soft">
                <p className="font-semibold text-slate-700">Is this your workshop?</p>
                <p className="mb-4 mt-1 text-sm text-slate-500">Claim your listing to respond to reviews, update details, and receive quote requests.</p>
                <a href={`/claim/${mechanic.slug}`} className="inline-block rounded-full bg-ink px-6 py-2 text-sm font-semibold text-white transition hover:bg-bonnet">Claim this workshop →</a>
              </div>
            )}
          </aside>
        </div>

        {related.length > 0 && (
          <div className="pb-16">
            <h2 className="mb-6 text-2xl font-bold text-slate-950">More workshops in {mechanic.city}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => <WorkshopCard key={item.slug} mechanic={item} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
