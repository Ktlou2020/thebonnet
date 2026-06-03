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
import type { Metadata } from "next";

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

export default async function MechanicDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [mechanic, session] = await Promise.all([getMechanicBySlug(slug), auth()]);

  if (!mechanic) notFound();

  const related = await getRelatedMechanics(mechanic, 3);
  const telHref = mechanic.phone ? `tel:${mechanic.phone.replace(/\s+/g, "")}` : null;
  const quoteHref = `/request-quote?${new URLSearchParams({ city: mechanic.city, service: mechanic.services[0] ?? "General Service" }).toString()}`;

  // Fetch approved reviews from DB (gracefully skip if no DB)
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
  let reviews: ReviewRow[] = [];
  let workshopOpeningHours: Record<string, string | null> | null = null;
  try {
    const workshop = await db.workshop.findUnique({
      where: { slug },
      select: { id: true, openingHours: true },
    });
    if (workshop) {
      workshopOpeningHours = workshop.openingHours as Record<string, string | null> | null;
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

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <WorkshopSchema mechanic={mechanic} />
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <div className="flex flex-wrap items-center gap-3">
            {mechanic.featured ? <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-amber-700">Featured listing</span> : null}
            {mechanic.mobile ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Mobile support</span> : null}
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{mechanic.source}</span>
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">{mechanic.name}</h1>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><span>{mechanic.address}</span></div>
            <div className="flex items-center gap-2"><Star className="h-4 w-4 fill-gold text-gold" />{mechanic.rating.toFixed(1)} public rating</div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" />{mechanic.city}, {mechanic.province}</div>
            <div className="flex items-center gap-2">Listing type: {mechanic.types.slice(0, 2).join(", ")}</div>
          </div>

          <div className="mt-8 rounded-[1.5rem] bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-slate-950">Opening hours</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{mechanic.hours}</p>
          </div>

          <OpeningHours hours={workshopOpeningHours} />

          {(() => {
            const mapsQuery = encodeURIComponent(`${mechanic.name}, ${mechanic.city}, South Africa`);
            return (
              <iframe
                src={`https://maps.google.com/maps?q=${mapsQuery}&output=embed`}
                className="mt-8 w-full h-64 rounded-2xl border border-slate-200"
                loading="lazy"
                title={`${mechanic.name} location`}
              />
            );
          })()}

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-950">Service categories</h2>
              <div className="mt-4 flex flex-wrap gap-2">{mechanic.services.map((service) => <span key={service} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">{service}</span>)}</div>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-5">
              <h2 className="text-lg font-semibold text-slate-950">Workshop profile</h2>
              <div className="mt-4 flex flex-wrap gap-2">{mechanic.types.map((type) => <span key={type} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700">{type}</span>)}</div>
            </div>
          </div>

          {related.length ? (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-slate-950">More workshops in {mechanic.city}</h2>
              <div className="mt-4 flex flex-wrap gap-3">{related.map((item) => <Link key={item.slug} href={`/mechanics/${item.slug}`} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">{item.name}</Link>)}</div>
            </div>
          ) : null}

          {/* Reviews section */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-950">Customer reviews</h2>
              {reviews.length > 0 && (
                <span className="text-sm text-slate-500">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
              )}
            </div>
            {reviews.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-slate-500 text-sm">No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <ReviewCard
                    key={r.id}
                    review={{
                      ...r,
                      repliedAt: r.repliedAt ? r.repliedAt.toISOString() : null,
                      createdAt: r.createdAt.toISOString(),
                    }}
                  />
                ))}
              </div>
            )}

            {session ? (
              <div className="mt-6">
                <ReviewForm workshopSlug={mechanic.slug} />
              </div>
            ) : (
              <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-soft">
                <p className="text-sm text-slate-600">
                  <Link href="/login" className="font-semibold text-fire hover:underline">Sign in</Link>
                  {" "}to leave a review for this workshop.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-accent">Contact this workshop</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">Use the public contact details below or send one quote request through The Bonnet so you do not need to message workshops one by one.</p>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              {mechanic.phone ? <div>Phone: <span className="font-semibold text-slate-950">{mechanic.phone}</span></div> : null}
              {mechanic.website ? <div className="break-all">Website: <span className="font-semibold text-slate-950">{mechanic.website}</span></div> : null}
              <div>Source: <span className="font-semibold text-slate-950">{mechanic.source}</span></div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Link href={quoteHref} className="rounded-full bg-ink px-4 py-3 text-center text-sm font-semibold text-white">Request quotes in {mechanic.city}</Link>
              {telHref ? <a href={telHref} className="rounded-full border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700"><PhoneCall className="mr-2 inline-flex h-4 w-4" />Call workshop</a> : null}
              {mechanic.website ? <a href={mechanic.website} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700"><Globe className="mr-2 inline-flex h-4 w-4" />Visit website</a> : null}
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-slate-950">About this listing</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">This profile is part of The Bonnet directory and is designed to make workshop discovery clearer, more trustworthy, and more useful for customers.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
