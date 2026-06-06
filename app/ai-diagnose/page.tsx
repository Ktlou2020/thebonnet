"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Car,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  ChevronRight,
} from "lucide-react";
import type { AiDiagnosisResult, UrgencyLevel } from "@/lib/types";

const MAKES = [
  "Toyota", "Volkswagen", "Ford", "Hyundai", "Suzuki", "Kia", "Renault",
  "BMW", "Mercedes-Benz", "Audi", "Nissan", "Isuzu", "Haval", "Chery", "GWM", "Other",
];

const YEARS = Array.from({ length: 26 }, (_, i) => 2025 - i);

type Step = 1 | 2 | 3;

interface FormState {
  make: string;
  model: string;
  year: string;
  mileage: string;
  description: string;
  selfUrgency: string;
}

const urgencyConfig: Record<UrgencyLevel, { label: string; colour: string; bg: string }> = {
  routine: { label: "Routine", colour: "text-green-700", bg: "bg-green-100" },
  soon: { label: "Fix Soon", colour: "text-amber-700", bg: "bg-amber-100" },
  urgent: { label: "Urgent", colour: "text-orange-700", bg: "bg-orange-100" },
  emergency: { label: "Emergency", colour: "text-red-700", bg: "bg-red-100" },
};

const likelihoodDot: Record<"high" | "medium" | "low", string> = {
  high: "bg-orange-500",
  medium: "bg-amber-400",
  low: "bg-slate-300",
};

export default function AiDiagnosePage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>({
    make: "",
    model: "",
    year: "",
    mileage: "",
    description: "",
    selfUrgency: "not_sure",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiDiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function update(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function runDiagnosis() {
    setLoading(true);
    setError(null);
    setResult(null);
    setStep(3);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          make: form.make,
          model: form.model,
          year: form.year,
          description: form.description,
        }),
      });

      if (res.status === 503) {
        setError("not_configured");
        return;
      }

      if (!res.ok) {
        setError("AI service returned an error. Please try again.");
        return;
      }

      const data = await res.json();
      setResult(data.result);
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyBrief() {
    if (!result) return;
    navigator.clipboard.writeText(result.mechanicBrief).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header strip */}
      <div className="bg-ink text-white px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-fire/30 bg-fire/10 px-4 py-1.5 text-sm font-medium text-white/90 mb-4">
            <Car className="h-4 w-4 text-fire" />
            AI-powered
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Diagnose your car problem</h1>
          <p className="mt-2 text-slate-300 text-sm leading-7">
            Describe your issue in plain English. We&apos;ll identify likely causes, estimate costs, and write a mechanic brief you can share.
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            {(["Vehicle info", "Describe issue", "Results"] as const).map((label, i) => {
              const n = (i + 1) as Step;
              const active = step === n;
              const done = step > n;
              return (
                <div key={label} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight className="h-4 w-4 text-slate-400" />}
                  <span
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-medium transition ${
                      done
                        ? "bg-green-100 text-green-700"
                        : active
                        ? "bg-fire text-white"
                        : "text-slate-400"
                    }`}
                  >
                    {done ? <CheckCircle className="h-3.5 w-3.5" /> : <span className="text-xs">{n}</span>}
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
        {/* ─── Step 1 ─── */}
        {step === 1 && (
          <div className="rounded-[2rem] bg-white p-8 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Tell us about your vehicle</h2>
            <div className="grid gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Make</label>
                <select
                  value={form.make}
                  onChange={(e) => update("make", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-fire focus:outline-none focus:ring-2 focus:ring-fire/20"
                >
                  <option value="">Select make...</option>
                  {MAKES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Model</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => update("model", e.target.value)}
                  placeholder="e.g. Polo, Hilux, Swift..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-fire focus:outline-none focus:ring-2 focus:ring-fire/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Year</label>
                  <select
                    value={form.year}
                    onChange={(e) => update("year", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-fire focus:outline-none focus:ring-2 focus:ring-fire/20"
                  >
                    <option value="">Year...</option>
                    {YEARS.map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Mileage <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="number"
                    value={form.mileage}
                    onChange={(e) => update("mileage", e.target.value)}
                    placeholder="km"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-fire focus:outline-none focus:ring-2 focus:ring-fire/20"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!form.make || !form.model}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-fire px-7 py-3.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next: Describe the issue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ─── Step 2 ─── */}
        {step === 2 && (
          <div className="rounded-[2rem] bg-white p-8 shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Describe the issue</h2>
            <p className="text-sm text-slate-500 mb-6">
              You&apos;re diagnosing your {form.year} {form.make} {form.model}
            </p>
            <div className="grid gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">What&apos;s happening?</label>
                <textarea
                  ref={textareaRef}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={6}
                  placeholder={"Examples:\n• \"There's a grinding noise when I brake\"\n• \"The engine warning light came on and the car shakes at idle\"\n• \"Strong burning smell from under my bonnet after long trips\""}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-fire focus:outline-none focus:ring-2 focus:ring-fire/20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">How urgent does it feel?</label>
                <select
                  value={form.selfUrgency}
                  onChange={(e) => update("selfUrgency", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-fire focus:outline-none focus:ring-2 focus:ring-fire/20"
                >
                  <option value="not_sure">Not sure</option>
                  <option value="can_wait">Can wait a few weeks</option>
                  <option value="fix_soon">Should fix within a week</option>
                  <option value="emergency">Emergency — happening right now</option>
                </select>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="rounded-full border border-slate-200 px-6 py-3.5 text-sm font-medium text-slate-600 transition hover:border-slate-300"
              >
                Back
              </button>
              <button
                onClick={runDiagnosis}
                disabled={!form.description.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-fire px-7 py-3.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Diagnose my issue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 3 ─── */}
        {step === 3 && (
          <div>
            {/* Loading */}
            {loading && (
              <div className="rounded-[2rem] bg-white p-12 shadow-soft flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 text-fire animate-spin" />
                <p className="text-slate-600 font-medium">Analysing your issue...</p>
                <p className="text-sm text-slate-400">This usually takes 5-10 seconds</p>
              </div>
            )}

            {/* Error: not configured */}
            {!loading && error === "not_configured" && (
              <div className="rounded-[2rem] bg-white p-8 shadow-soft">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-amber-100 p-3 text-amber-600 shrink-0">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">AI service not yet configured</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      The AI diagnosis feature requires an Anthropic API key to be set. In the meantime, you can still browse workshops in the directory or request a quote directly.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href="/mechanics"
                        className="rounded-full bg-fire px-5 py-2.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
                      >
                        Browse mechanics
                      </Link>
                      <Link
                        href="/request-quote"
                        className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                      >
                        Request a quote
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error: generic */}
            {!loading && error && error !== "not_configured" && (
              <div className="rounded-[2rem] bg-white p-8 shadow-soft">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-red-100 p-3 text-red-600 shrink-0">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Something went wrong</h2>
                    <p className="mt-2 text-sm text-slate-600">{error}</p>
                    <button
                      onClick={() => { setStep(2); setError(null); }}
                      className="mt-4 rounded-full bg-fire px-5 py-2.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {!loading && result && (
              <div className="space-y-5">
                {/* Vehicle + Urgency header */}
                <div className="rounded-[2rem] bg-white p-6 shadow-soft flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Diagnosis for</p>
                    <h2 className="text-xl font-bold text-slate-900 mt-1">
                      {form.year} {form.make} {form.model}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-bold ${
                      urgencyConfig[result.urgencyLevel].bg
                    } ${urgencyConfig[result.urgencyLevel].colour}`}
                  >
                    {urgencyConfig[result.urgencyLevel].label}
                  </span>
                </div>

                {/* Urgency note */}
                <div className={`rounded-[2rem] p-5 text-sm leading-7 font-medium ${
                  urgencyConfig[result.urgencyLevel].bg
                } ${urgencyConfig[result.urgencyLevel].colour}`}>
                  {result.urgencyNote}
                </div>

                {/* Likely causes */}
                <div className="rounded-[2rem] bg-white p-6 shadow-soft">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Likely causes</h3>
                  <div className="space-y-4">
                    {result.likelyCauses.map((cause, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${likelihoodDot[cause.likelihood]}`} />
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{cause.cause}</p>
                          <p className="text-sm text-slate-500 mt-0.5 leading-6">{cause.explanation}</p>
                          <span className={`mt-1 inline-block text-xs font-semibold uppercase tracking-wide ${
                            cause.likelihood === "high" ? "text-orange-500" :
                            cause.likelihood === "medium" ? "text-amber-500" : "text-slate-400"
                          }`}>{cause.likelihood} likelihood</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost estimate */}
                <div className="rounded-[2rem] bg-ink text-white p-6 shadow-soft">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-3">Estimated cost</h3>
                  <p className="text-4xl font-bold text-fire">
                    R{result.estimatedCost.low.toLocaleString()} – R{result.estimatedCost.high.toLocaleString()}
                  </p>
                  <p className="mt-2 text-sm text-slate-300">{result.estimatedCost.note}</p>
                </div>

                {/* Parts involved */}
                {result.partsInvolved.length > 0 && (
                  <div className="rounded-[2rem] bg-white p-6 shadow-soft">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Parts likely involved</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.partsInvolved.map((part) => (
                        <span key={part} className="rounded-full bg-fire/10 px-3 py-1.5 text-sm font-medium text-fire">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Questions to ask */}
                {result.questionsToAsk.length > 0 && (
                  <div className="rounded-[2rem] bg-white p-6 shadow-soft">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Questions to ask your mechanic</h3>
                    <ul className="space-y-2">
                      {result.questionsToAsk.map((q, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fire" />
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mechanic brief */}
                <div className="rounded-[2rem] bg-white p-6 shadow-soft border border-fire/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-900">Mechanic brief</h3>
                    <button
                      onClick={copyBrief}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition hover:border-fire hover:text-fire"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-sm leading-7 text-slate-700 bg-slate-50 rounded-2xl p-4">
                    {result.mechanicBrief}
                  </p>
                </div>

                {/* CTA */}
                <div className="rounded-[2rem] bg-fire/5 border border-fire/20 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">Ready to get it fixed?</p>
                    <p className="text-sm text-slate-500 mt-1">Share this brief with workshops and get quotes in one request.</p>
                  </div>
                  <Link
                    href="/request-quote?service=General+Service"
                    className="inline-flex items-center gap-2 rounded-full bg-fire px-6 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 whitespace-nowrap"
                  >
                    Request quotes from mechanics <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Diagnose again */}
                <button
                  onClick={() => { setStep(1); setResult(null); setForm({ make: "", model: "", year: "", mileage: "", description: "", selfUrgency: "not_sure" }); }}
                  className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2"
                >
                  Start a new diagnosis
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
