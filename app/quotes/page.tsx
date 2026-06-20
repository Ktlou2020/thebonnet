"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Wrench, Clock, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

type QuoteData = {
  id: string;
  totalCents: number;
  workshopMessage: string | null;
  responseTime: number | null;
  isAccepted: boolean;
  status: string;
  createdAt: string;
  assignment: {
    workshop: {
      id: string;
      name: string;
      slug: string;
      city: string;
      phone?: string | null;
      whatsapp?: string | null;
    };
  };
};

type LeadData = {
  id: string;
  serviceNeeded: string;
  city: string | null;
  vehicleLabel: string;
  status: string;
  createdAt: string;
  assignments: Array<{
    id: string;
    quote: QuoteData | null;
    workshop: {
      id: string;
      name: string;
      slug: string;
      city: string;
      phone?: string | null;
      whatsapp?: string | null;
    };
  }>;
};

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  NEW: { label: "Pending", classes: "bg-slate-100 text-slate-600" },
  PENDING: { label: "Pending", classes: "bg-slate-100 text-slate-600" },
  RESPONDED: { label: "Quoted", classes: "bg-amber-50 text-amber-700" },
  QUOTED: { label: "Quoted", classes: "bg-amber-50 text-amber-700" },
  ACCEPTED: { label: "Accepted", classes: "bg-emerald-50 text-emerald-700" },
  CLOSED_WON: { label: "Accepted", classes: "bg-emerald-50 text-emerald-700" },
  DECLINED: { label: "Declined", classes: "bg-red-50 text-red-700" },
  EXPIRED: { label: "Expired", classes: "bg-slate-100 text-slate-400" },
};

function responseTimePill(minutes: number | null): string | null {
  if (!minutes) return null;
  if (minutes < 60) return `Replied in ${minutes}m`;
  const h = Math.round(minutes / 60);
  return `Replied in ${h}h`;
}

export default function QuotesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/quotes")
      .then((r) => r.json())
      .then((data: { leads: LeadData[] }) => {
        setLeads(data.leads ?? []);
        setLoading(false);
      })
      .catch(() => { setFetchError(true); setLoading(false); });
  }, [status]);

  async function acceptQuote(quoteId: string) {
    await fetch(`/api/quotes/${quoteId}/accept`, { method: "POST" });
    setLeads((prev) =>
      prev.map((lead) => ({
        ...lead,
        assignments: lead.assignments.map((a) =>
          a.quote?.id === quoteId
            ? { ...a, quote: { ...a.quote!, isAccepted: true, status: "ACCEPTED" } }
            : a
        ),
        status: lead.assignments.some((a) => a.quote?.id === quoteId) ? "ACCEPTED" : lead.status,
      }))
    );
  }

  async function declineQuote(quoteId: string) {
    await fetch(`/api/quotes/${quoteId}/decline`, { method: "POST" }).catch(() => null);
    setLeads((prev) =>
      prev.map((lead) => ({
        ...lead,
        assignments: lead.assignments.map((a) =>
          a.quote?.id === quoteId
            ? { ...a, quote: { ...a.quote!, status: "DECLINED" } }
            : a
        ),
      }))
    );
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-fire border-t-transparent" />
      </div>
    );
  }

  if (!session) return null;

  const pending = leads.filter((l) => ["NEW", "PENDING", "QUALIFIED", "ASSIGNED"].includes(l.status));
  const responded = leads.filter((l) => ["RESPONDED", "QUOTED"].includes(l.status));
  const accepted = leads.filter((l) => ["ACCEPTED", "CLOSED_WON"].includes(l.status));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ink text-white px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold">My Quotes</h1>
          <p className="mt-1 text-slate-300 text-sm">Track your quote requests and responses from workshops.</p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
        {fetchError ? (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-10 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-slate-900">Couldn&apos;t load your quotes</h2>
            <p className="text-slate-500 mt-2 mb-6">There was a problem connecting. Please try again in a moment.</p>
            <button onClick={() => window.location.reload()} className="bg-fire text-white rounded-full px-6 py-2.5 text-sm font-semibold">Retry</button>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-slate-900">No quotes yet</h2>
            <p className="text-slate-500 mt-2 mb-6">Request a quote from a workshop and it&apos;ll appear here once workshops respond.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="/request-quote" className="bg-fire text-white rounded-full px-6 py-3 text-sm font-semibold inline-block shadow-glow-fire">Request a quote</a>
              <a href="/mechanics" className="border border-slate-200 text-slate-700 rounded-full px-6 py-3 text-sm font-semibold inline-block">Browse mechanics</a>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {[
              { title: "Waiting for responses", items: pending, icon: Clock },
              { title: "Quotes received", items: responded, icon: Wrench },
              { title: "Accepted", items: accepted, icon: CheckCircle },
            ].map(({ title, items, icon: Icon }) =>
              items.length > 0 ? (
                <section key={title}>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="h-4 w-4 text-fire" />
                    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{items.length}</span>
                  </div>
                  <div className="space-y-4">
                    {items.map((lead) => {
                      const statusInfo = STATUS_LABELS[lead.status] ?? STATUS_LABELS.NEW;
                      const expanded = expandedLead === lead.id;
                      const quotedAssignments = lead.assignments.filter((a) => a.quote);

                      return (
                        <div key={lead.id} className="rounded-[2rem] bg-white border border-slate-200 shadow-soft overflow-hidden">
                          <div className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusInfo.classes}`}>
                                    {statusInfo.label}
                                  </span>
                                  <span className="rounded-full bg-fire/10 px-2.5 py-0.5 text-xs font-medium text-fire">
                                    {lead.serviceNeeded}
                                  </span>
                                </div>
                                <p className="font-semibold text-slate-900">{lead.vehicleLabel}</p>
                                <p className="text-sm text-slate-500">{lead.city ?? "Location not set"}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs text-slate-400">
                                  {new Date(lead.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                                {quotedAssignments.length > 0 && (
                                  <button
                                    onClick={() => setExpandedLead(expanded ? null : lead.id)}
                                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-fire"
                                  >
                                    {quotedAssignments.length} quote{quotedAssignments.length !== 1 ? "s" : ""}
                                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {expanded && quotedAssignments.length > 0 && (
                            <div className="border-t border-slate-100 px-6 pb-6 pt-4 space-y-4">
                              {quotedAssignments.map((a) => {
                                const q = a.quote!;
                                const timePill = responseTimePill(q.responseTime);
                                return (
                                  <div key={a.id} className="rounded-2xl border border-slate-200 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div>
                                        <p className="font-semibold text-slate-900">{a.workshop.name}</p>
                                        <p className="text-sm text-slate-500">{a.workshop.city}</p>
                                        {timePill && (
                                          <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                            {timePill}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-right shrink-0">
                                        <p className="text-xl font-bold text-slate-900">
                                          R{(q.totalCents / 100).toLocaleString("en-ZA")}
                                        </p>
                                        {q.isAccepted ? (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">✓ Booked</span>
                                        ) : q.status === "DECLINED" ? (
                                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">Declined</span>
                                        ) : (
                                          <div className="mt-2 flex flex-col items-end gap-1.5">
                                            <button
                                              onClick={() => acceptQuote(q.id)}
                                              className="rounded-full bg-fire px-4 py-1.5 text-xs font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
                                            >
                                              Accept quote
                                            </button>
                                            <button
                                              onClick={() => declineQuote(q.id)}
                                              className="text-xs text-slate-400 underline underline-offset-2 hover:text-slate-600 transition"
                                            >
                                              Not for me
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {q.isAccepted && (a.workshop.phone || a.workshop.whatsapp) && (
                                      <div className="mt-3 border-t border-slate-100 pt-3 flex flex-wrap gap-2">
                                        {a.workshop.phone && (
                                          <a
                                            href={`tel:${a.workshop.phone.replace(/\s+/g, "")}`}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                                          >
                                            📞 Call workshop
                                          </a>
                                        )}
                                        {a.workshop.whatsapp && (
                                          <a
                                            href={`https://wa.me/${a.workshop.whatsapp.replace(/\D/g, "")}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                                          >
                                            💬 WhatsApp workshop
                                          </a>
                                        )}
                                      </div>
                                    )}
                                    {q.workshopMessage && (
                                      <p className="mt-3 text-sm leading-6 text-slate-600 border-t border-slate-100 pt-3">{q.workshopMessage}</p>
                                    )}
                                    {q.isAccepted && (
                                      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                                        <div>
                                          <p className="text-xs font-semibold text-emerald-800">Job done? Leave a review and earn 100 XP ⭐</p>
                                          <p className="text-xs text-emerald-600 mt-0.5">Help other drivers find great mechanics.</p>
                                        </div>
                                        <a href={`/mechanics/${a.workshop.slug}`} className="shrink-0 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition">
                                          Review →
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : null
            )}
          </div>
        ) }

        <div className="mt-12 text-center">
          <Link
            href="/request-quote"
            className="inline-flex items-center gap-2 rounded-full bg-fire px-6 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
          >
            + New quote request
          </Link>
        </div>
      </div>
    </div>
  );
}
