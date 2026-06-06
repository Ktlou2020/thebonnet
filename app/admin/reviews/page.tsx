"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

type ReviewRow = {
  id: string;
  authorName: string;
  rating: number;
  body: string | null;
  profileId: string | null;
  createdAt: string;
  workshop: { name: string; slug: string };
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
        />
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchReviews() {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    if (res.ok) {
      const data = (await res.json()) as { reviews: ReviewRow[] };
      setReviews(data.reviews);
    }
    setLoading(false);
  }

  useEffect(() => {
    void fetchReviews();
  }, []);

  async function handleAction(id: string, action: "approve" | "reject") {
    await fetch(`/api/admin/reviews/${id}/${action}`, { method: "POST" });
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Review Moderation</h1>
      <p className="text-sm text-slate-500 mb-6">Approve or reject pending customer reviews.</p>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-fire border-t-transparent" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-16 text-center shadow-soft">
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-semibold text-slate-700">No pending reviews</p>
        </div>
      ) : (
        <div className="rounded-[2rem] border border-slate-200 bg-white shadow-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left">Workshop</th>
                <th className="px-6 py-3 text-left">Rating</th>
                <th className="px-6 py-3 text-left">Review</th>
                <th className="px-6 py-3 text-left">Reviewer</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">{r.workshop.name}</td>
                  <td className="px-6 py-4">
                    <StarRating rating={r.rating} />
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs">
                    {r.body ? r.body.slice(0, 100) + (r.body.length > 100 ? "…" : "") : <span className="text-slate-400 italic">No text</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{r.authorName}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(r.createdAt).toLocaleDateString("en-ZA")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(r.id, "approve")}
                        className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(r.id, "reject")}
                        className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
