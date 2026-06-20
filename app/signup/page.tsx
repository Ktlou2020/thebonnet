"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Loader2, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";

const SA_CITIES = [
  "Cape Town", "Johannesburg", "Pretoria", "Durban", "Gqeberha",
  "East London", "Bloemfontein", "Nelspruit", "Polokwane", "Kimberley", "Other",
];
const SERVICES = [
  "Oil Service", "Major Service", "Tyres", "Brakes",
  "Electrical", "Aircon", "Suspension", "Body & Paint",
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex gap-3 mt-1.5">
      {checks.map(({ label, pass }) => (
        <span key={label} className={`flex items-center gap-1 text-xs ${pass ? "text-emerald-400" : "text-slate-500"}`}>
          <CheckCircle className={`h-3 w-3 ${pass ? "text-emerald-400" : "text-slate-600"}`} />
          {label}
        </span>
      ))}
    </div>
  );
}

function SignupContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<"driver" | "workshop">(
    params.get("type") === "workshop" ? "workshop" : "driver"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Driver fields
  const [driverName, setDriverName] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const [driverPassword, setDriverPassword] = useState("");
  const [showDriverPw, setShowDriverPw] = useState(false);
  const [driverTerms, setDriverTerms] = useState(false);

  // Workshop fields
  const [bizName, setBizName] = useState("");
  const [contactName, setContactName] = useState("");
  const [wsEmail, setWsEmail] = useState("");
  const [wsPassword, setWsPassword] = useState("");
  const [showWsPw, setShowWsPw] = useState(false);
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [wsTerms, setWsTerms] = useState(false);

  const toggleService = (s: string) =>
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  async function handleDriver(e: React.FormEvent) {
    e.preventDefault();
    if (!driverTerms) { setError("Please agree to the terms."); return; }
    if (driverPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: driverEmail,
          password: driverPassword,
          fullName: driverName,
          userRole: "DRIVER",
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Registration failed."); setLoading(false); return; }

      const result = await signIn("credentials", {
        email: driverEmail,
        password: driverPassword,
        redirect: false,
      });
      if (result?.error) { setError("Account created but sign-in failed. Please sign in manually."); setLoading(false); return; }
      router.push("/onboarding");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleWorkshop(e: React.FormEvent) {
    e.preventDefault();
    if (!wsTerms) { setError("Please agree to the terms."); return; }
    if (wsPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: wsEmail,
          password: wsPassword,
          fullName: contactName,
          userRole: "WORKSHOP_OWNER",
          phone,
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Registration failed."); setLoading(false); return; }

      // Create the workshop record
      await fetch("/api/signup/workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: bizName, contactName, email: wsEmail, phone, city, services }),
      });

      const result = await signIn("credentials", {
        email: wsEmail,
        password: wsPassword,
        redirect: false,
      });
      if (result?.error) { setError("Account created but sign-in failed. Please sign in manually."); setLoading(false); return; }
      router.push("/onboarding");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-full border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 text-sm focus:border-fire focus:outline-none transition";
  const labelCls = "block text-sm font-medium text-white/80 mb-1";

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 rounded-full border border-white/10 p-1 bg-white/5">
        {(["driver", "workshop"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(""); }}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
              tab === t ? "bg-fire text-white" : "text-white/60 hover:text-white"
            }`}
          >
            {t === "driver" ? "I'm a driver" : "I have a workshop"}
          </button>
        ))}
      </div>

      {tab === "driver" ? (
        <form onSubmit={handleDriver} className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">Start tracking your car</h2>
            <p className="text-slate-400 text-sm mt-1">Free to join. No deposit. No pressure.</p>
          </div>

          <div>
            <label className={labelCls}>Full name</label>
            <input
              className={inputCls}
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="Jane Smith"
              autoComplete="name"
            />
          </div>

          <div>
            <label className={labelCls}>Email address</label>
            <input
              type="email"
              required
              className={inputCls}
              value={driverEmail}
              onChange={(e) => setDriverEmail(e.target.value)}
              placeholder="jane@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className={labelCls}>Password</label>
            <div className="relative">
              <input
                type={showDriverPw ? "text" : "password"}
                required
                minLength={8}
                className={`${inputCls} pr-11`}
                value={driverPassword}
                onChange={(e) => setDriverPassword(e.target.value)}
                placeholder="Choose a password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowDriverPw((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                aria-label={showDriverPw ? "Hide password" : "Show password"}
              >
                {showDriverPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrength password={driverPassword} />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={driverTerms}
              onChange={(e) => setDriverTerms(e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-sm text-slate-400">
              I agree to the{" "}
              <Link href="/terms" className="text-fire underline">
                terms of service
              </Link>
            </span>
          </label>

          {error && (
            <p className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-fire px-6 py-3 text-sm font-semibold text-white shadow-glow-fire hover:bg-fire/90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {loading ? "Creating account…" : "Create free account"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleWorkshop} className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">Register your workshop</h2>
            <p className="text-slate-400 text-sm mt-1">Start receiving qualified leads from drivers near you.</p>
          </div>

          <div>
            <label className={labelCls}>Workshop name</label>
            <input
              required
              className={inputCls}
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              placeholder="Joe's Auto Workshop"
            />
          </div>

          <div>
            <label className={labelCls}>Your name</label>
            <input
              className={inputCls}
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Joe Smith"
              autoComplete="name"
            />
          </div>

          <div>
            <label className={labelCls}>Email address</label>
            <input
              type="email"
              required
              className={inputCls}
              value={wsEmail}
              onChange={(e) => setWsEmail(e.target.value)}
              placeholder="joe@workshop.co.za"
              autoComplete="email"
            />
          </div>

          <div>
            <label className={labelCls}>Password</label>
            <div className="relative">
              <input
                type={showWsPw ? "text" : "password"}
                required
                minLength={8}
                className={`${inputCls} pr-11`}
                value={wsPassword}
                onChange={(e) => setWsPassword(e.target.value)}
                placeholder="Choose a password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowWsPw((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                aria-label={showWsPw ? "Hide password" : "Show password"}
              >
                {showWsPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrength password={wsPassword} />
          </div>

          <div>
            <label className={labelCls}>Phone number</label>
            <input
              className={inputCls}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+27 81 234 5678"
              autoComplete="tel"
            />
          </div>

          <div>
            <label className={labelCls}>City</label>
            <select
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputCls}
            >
              <option value="">Select city…</option>
              {SA_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Services offered</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SERVICES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleService(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                    services.includes(s)
                      ? "bg-fire border-fire text-white"
                      : "border-white/20 text-white/70 hover:border-white/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={wsTerms}
              onChange={(e) => setWsTerms(e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-sm text-slate-400">
              I agree to the{" "}
              <Link href="/terms" className="text-fire underline">
                terms of service
              </Link>
            </span>
          </label>

          {error && (
            <p className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-fire px-6 py-3 text-sm font-semibold text-white shadow-glow-fire hover:bg-fire/90 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {loading ? "Creating account…" : "Register workshop"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="text-fire underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-white">
            My Bonnet
          </Link>
        </div>
        <Suspense fallback={null}>
          <SignupContent />
        </Suspense>
      </div>
    </div>
  );
}
