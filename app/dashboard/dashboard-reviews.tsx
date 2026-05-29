"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

type ReviewData = {
  id: string;
  authorName: string;
  rating: number;
  body: string | null;
  jobType: string | null;
  reply: string | null;
  status: string;
  createdAt: string;
};

export function DashboardReviews({ workshopId }: { workshopId: string }) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard/reviews?workshopId=${workshopId}`)
      .then((r) => r.json())
      .then((data: { reviews: ReviewData[] }) => {
        setReviews(data.reviews ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [workshopId]);

  async function submitReply(reviewId: string) {
    const text = replyText[reviewId];
    if (!text?.trim()) return;
    setSubmitting(reviewId);

    await fetch(`/api/dashboard/reviews/${reviewId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: text.trim() }),
    });

    setSubmitting(null);
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, reply: text.trim() } : r))
    );
    setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-fire border-t-transparent" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <div key={r.id} className="rounded-[2rem] bg-white border border-slate-200 shadow-soft p-6">
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
            ))}
            <span className="ml-2 text-sm font-semibold text-slate-900">{r.authorName}</span>
            {r.jobType && (
              <span className="ml-2 rounded-full bg-fire/10 px-2 py-0.5 text-xs font-medium text-fire">{r.jobType}</span>
            )}
            <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              r.status === "APPROVED" ? "bg-emerald-50 text-emerald-700" :
              r.status === "REJECTED" ? "bg-red-50 text-red-700" :
              "bg-amber-50 text-amber-700"
            }`}>{r.status}</span>
          </div>
          {r.body && <p className="text-sm text-slate-600 leading-6">{r.body}</p>}
          <p className="text-xs text-slate-400 mt-2">
            {new Date(r.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
          </p>

          {r.reply ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-700">Your reply: </span>{r.reply}
            </div>
          ) : (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <label className="block text-xs font-medium text-slate-600 mb-2">Reply to this review</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText[r.id] ?? ""}
                  onChange={(e) => setReplyText((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  placeholder="Write your response..."
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-fire focus:outline-none"
                />
                <button
                  onClick={() => submitReply(r.id)}
                  disabled={!replyText[r.id]?.trim() || submitting === r.id}
                  className="rounded-full bg-fire px-4 py-2.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40"
                >
                  {submitting === r.id ? "..." : "Reply"}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
