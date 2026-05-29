"use client";

import { useState } from "react";
import { Star, ThumbsUp, ShieldCheck, MessageSquare } from "lucide-react";

export type ReviewCardData = {
  id: string;
  authorName: string;
  rating: number;
  body: string | null;
  jobType: string | null;
  costCents: number | null;
  helpfulCount: number;
  reply: string | null;
  repliedAt: string | null;
  receiptVerified: boolean;
  createdAt: string;
};

export function ReviewCard({ review }: { review: ReviewCardData }) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [voted, setVoted] = useState(false);

  async function handleHelpful() {
    if (voted) return;
    setVoted(true);
    setHelpfulCount((n) => n + 1);
    await fetch(`/api/reviews/${review.id}/helpful`, { method: "POST" }).catch(() => null);
  }

  const formattedCost = review.costCents
    ? `R${(review.costCents / 100).toLocaleString("en-ZA")}`
    : null;

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
      {/* Star rating row */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
          />
        ))}
        <span className="ml-2 text-sm font-semibold text-slate-900">{review.rating}/5</span>
      </div>

      {/* Author + date */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-semibold text-slate-900 text-sm">{review.authorName}</span>
        {review.receiptVerified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-3 w-3" /> Verified
          </span>
        )}
        {review.jobType && (
          <span className="rounded-full bg-fire/10 px-2 py-0.5 text-xs font-medium text-fire">
            {review.jobType}
          </span>
        )}
        {formattedCost && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {formattedCost}
          </span>
        )}
        <span className="ml-auto text-xs text-slate-400">
          {new Date(review.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>

      {/* Body */}
      {review.body && (
        <p className="mt-3 text-sm leading-6 text-slate-600">{review.body}</p>
      )}

      {/* Helpful button */}
      <div className="mt-4">
        <button
          onClick={handleHelpful}
          disabled={voted}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            voted
              ? "border-fire/20 bg-fire/5 text-fire"
              : "border-slate-200 text-slate-500 hover:border-fire/20 hover:text-fire"
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          Helpful ({helpfulCount})
        </button>
      </div>

      {/* Workshop reply */}
      {review.reply && (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-fire" />
            <span className="text-xs font-semibold text-slate-700">Workshop reply</span>
            {review.repliedAt && (
              <span className="text-xs text-slate-400">
                · {new Date(review.repliedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
          <p className="text-sm leading-6 text-slate-600">{review.reply}</p>
        </div>
      )}
    </div>
  );
}
