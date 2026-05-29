"use client";

import { useEffect, useState } from "react";

type QuoteData = {
  id: string;
  totalCents: number;
  status: string;
  workshopMessage: string | null;
};

type AssignmentData = {
  id: string;
  status: string;
  quote: QuoteData | null;
  lead: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    serviceNeeded: string;
    city: string | null;
    vehicleLabel: string;
    status: string;
    details: string | null;
    createdAt: string;
  };
};

export function DashboardLeads({
  workshopId,
  workshopName,
}: {
  workshopId: string;
  workshopName: string;
}) {
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteForm, setQuoteForm] = useState<Record<string, { amount: string; message: string }>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/leads?workshopId=${workshopId}`)
      .then((r) => r.json())
      .then((data: { assignments: AssignmentData[] }) => {
        setAssignments(data.assignments ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [workshopId]);

  async function submitQuote(assignmentId: string, leadId: string) {
    const form = quoteForm[assignmentId];
    if (!form?.amount) return;
    setSubmitting(assignmentId);

    await fetch("/api/dashboard/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignmentId,
        leadId,
        amountCents: Math.round(parseFloat(form.amount) * 100),
        message: form.message || undefined,
        workshopName,
      }),
    });

    setSubmitting(null);
    // Refresh
    fetch(`/api/dashboard/leads?workshopId=${workshopId}`)
      .then((r) => r.json())
      .then((data: { assignments: AssignmentData[] }) => setAssignments(data.assignments ?? []));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-fire border-t-transparent" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">No leads assigned to your workshop yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((a) => (
        <div key={a.id} className="rounded-[2rem] bg-white border border-slate-200 shadow-soft p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-slate-900">{a.lead.fullName}</span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-slate-500">{a.lead.email}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-fire/10 px-2.5 py-0.5 text-xs font-medium text-fire">{a.lead.serviceNeeded}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{a.lead.city ?? "Unknown city"}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">{a.lead.vehicleLabel}</span>
              </div>
              {a.lead.details && (
                <p className="mt-2 text-sm text-slate-500">{a.lead.details}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                a.quote ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}>
                {a.quote ? "Quoted" : "Pending"}
              </span>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(a.lead.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Quote response form */}
          {!a.quote && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold text-slate-700 mb-3">Submit your quote</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Amount (R)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">R</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={quoteForm[a.id]?.amount ?? ""}
                      onChange={(e) =>
                        setQuoteForm((f) => ({ ...f, [a.id]: { ...(f[a.id] ?? { amount: "", message: "" }), amount: e.target.value } }))
                      }
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-7 pr-3 py-2.5 text-sm focus:border-fire focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Message (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Includes parts and labour"
                    value={quoteForm[a.id]?.message ?? ""}
                    onChange={(e) =>
                      setQuoteForm((f) => ({ ...f, [a.id]: { ...(f[a.id] ?? { amount: "", message: "" }), message: e.target.value } }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-fire focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={() => submitQuote(a.id, a.lead.id)}
                disabled={!quoteForm[a.id]?.amount || submitting === a.id}
                className="mt-3 rounded-full bg-fire px-5 py-2.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40"
              >
                {submitting === a.id ? "Submitting..." : "Send quote"}
              </button>
            </div>
          )}

          {a.quote && (
            <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">Your quote: </span>
              R{(a.quote.totalCents / 100).toLocaleString("en-ZA")}
              {a.quote.workshopMessage && <span className="ml-2 text-slate-500">— {a.quote.workshopMessage}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
