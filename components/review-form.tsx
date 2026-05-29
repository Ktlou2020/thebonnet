"use client";

import { useState } from "react";
import { Star } from "lucide-react";

const JOB_TYPES = [
  "Oil Service",
  "Major Service",
  "Tyres",
  "Brakes",
  "Electrical",
  "Aircon",
  "Suspension",
  "Body & Paint",
  "Other",
];

export function ReviewForm({
  workshopSlug,
  onSuccess,
}: {
  workshopSlug: string;
  onSuccess?: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [jobType, setJobType] = useState("");
  const [cost, setCost] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating || !body.trim()) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workshopSlug,
        rating,
        body: body.trim(),
        jobType: jobType || undefined,
        costCents: cost ? Math.round(parseFloat(cost) * 100) : undefined,
      }),
    });

    setSubmitting(false);
    if (res.ok) {
      setSuccess(true);
      onSuccess?.();
    } else {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Something went wrong. Please try again.");
    }
  }

  if (success) {
    return (
      <div className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="font-semibold text-emerald-800">Review submitted — it will appear after approval.</p>
        <p className="mt-1 text-sm text-emerald-600">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
      <h3 className="text-lg font-bold text-slate-900 mb-5">Write a review</h3>

      {/* Star picker */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-600 mb-2">Rating *</label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const val = i + 1;
            return (
              <button
                key={val}
                type="button"
                onClick={() => setRating(val)}
                onMouseEnter={() => setHoverRating(val)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-7 w-7 ${
                    val <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Job type */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-600 mb-1">Job type</label>
        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-fire focus:outline-none"
        >
          <option value="">Select job type...</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Cost */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-600 mb-1">Approximate cost (ZAR, optional)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">R</span>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-7 pr-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-fire focus:outline-none"
          />
        </div>
      </div>

      {/* Body */}
      <div className="mb-5">
        <label className="block text-xs font-medium text-slate-600 mb-1">Your review *</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          required
          placeholder="Tell others about your experience..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:border-fire focus:outline-none resize-none"
        />
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!rating || !body.trim() || submitting}
        className="w-full rounded-full bg-fire px-5 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting..." : "Submit review"}
      </button>
    </form>
  );
}
