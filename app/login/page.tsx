"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { MailCheck, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn("nodemailer", { email, callbackUrl: "/onboarding", redirect: false });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-white">My Bonnet</span>
        </div>

        {sent ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
            <MailCheck className="mx-auto mb-4 h-12 w-12 text-fire" />
            <h1 className="text-2xl font-bold text-white mb-2">Check your inbox</h1>
            <p className="text-slate-400 text-sm leading-7">
              We sent a sign-in link to <strong className="text-white">{email}</strong>. It expires in 10 minutes.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="mt-6 text-sm text-fire underline underline-offset-2"
            >
              Try a different email
            </button>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm mb-6">Enter your email to receive a sign-in link. No password needed.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">Email address</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 text-sm focus:border-fire focus:outline-none"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-fire px-6 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                {loading ? "Sending…" : "Send sign-in link"}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-2 text-center text-sm text-slate-400">
              <Link href="/signup" className="transition hover:text-white">New driver? Sign up free →</Link>
              <Link href="/signup?type=workshop" className="transition hover:text-white">Register your workshop →</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
