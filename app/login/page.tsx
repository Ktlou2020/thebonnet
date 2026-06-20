"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

function LoginContent() {
  const params = useSearchParams();
  const router = useRouter();
  const callbackUrl = params.get("callbackUrl") || "/garage";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Incorrect email or password. Please try again.");
    } else {
      router.push(callbackUrl);
    }
  }

  const inputCls =
    "w-full rounded-full border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 text-sm focus:border-fire focus:outline-none transition";

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
      <p className="text-slate-400 text-sm mb-6">Sign in to your My Bonnet account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputCls}
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className={`${inputCls} pr-11`}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-fire px-6 py-3 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-center text-sm text-slate-400">
        <Link href="/signup" className="transition hover:text-white">
          New here? Create a free account →
        </Link>
        <Link href="/signup?type=workshop" className="transition hover:text-white">
          Register your workshop →
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-white">
            My Bonnet
          </Link>
        </div>
        <Suspense fallback={null}>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
