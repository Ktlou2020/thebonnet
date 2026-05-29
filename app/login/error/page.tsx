"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Suspense } from "react";

function ErrorContent() {
  const params = useSearchParams();
  const code = params.get("error");
  const message =
    code === "Verification"
      ? "This sign-in link has expired. Please request a new one."
      : code === "AccessDenied"
      ? "Access denied. You don't have permission to sign in."
      : "Something went wrong. Please try again.";

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 py-16 text-center">
      <AlertTriangle className="mb-6 h-12 w-12 text-amber-400" />
      <h1 className="text-2xl font-bold text-white mb-3">Sign-in failed</h1>
      <p className="text-slate-400 max-w-sm mb-8">{message}</p>
      <Link
        href="/login"
        className="rounded-full bg-fire px-6 py-3 text-sm font-semibold text-white shadow-glow-fire hover:bg-fire/90 transition"
      >
        Try again
      </Link>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorContent />
    </Suspense>
  );
}
