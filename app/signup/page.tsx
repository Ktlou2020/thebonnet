"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { MailCheck, Loader2, ArrowRight } from "lucide-react";

const SA_CITIES = ["Cape Town","Johannesburg","Pretoria","Durban","Gqeberha","East London","Bloemfontein","Nelspruit","Polokwane","Kimberley","Other"];
const SERVICES = ["Oil Service","Major Service","Tyres","Brakes","Electrical","Aircon","Suspension","Body & Paint"];

function SignupContent() {
  const params = useSearchParams();
  const [tab, setTab] = useState<"driver" | "workshop">(params.get("type") === "workshop" ? "workshop" : "driver");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [error, setError] = useState("");

  // Driver fields
  const [driverName, setDriverName] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const [driverTerms, setDriverTerms] = useState(false);

  // Workshop fields
  const [bizName, setBizName] = useState("");
  const [contactName, setContactName] = useState("");
  const [wsEmail, setWsEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [wsTerms, setWsTerms] = useState(false);

  const toggleService = (s: string) =>
    setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  async function handleDriver(e: React.FormEvent) {
    e.preventDefault();
    if (!driverTerms) { setError("Please agree to the terms."); return; }
    setLoading(true); setError("");
    try {
      await signIn("nodemailer", { email: driverEmail, callbackUrl: "/onboarding", redirect: false });
      setSentEmail(driverEmail); setSent(true);
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  async function handleWorkshop(e: React.FormEvent) {
    e.preventDefault();
    if (!wsTerms) { setError("Please agree to the terms."); return; }
    setLoading(true); setError("");
    try {
      await fetch("/api/signup/workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: bizName, contactName, email: wsEmail, phone, city, services }),
      });
      await signIn("nodemailer", { email: wsEmail, callbackUrl: "/onboarding", redirect: false });
      setSentEmail(wsEmail); setSent(true);
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  // suppress unused variable warning
  void driverName;

  if (sent) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
        <MailCheck className="mx-auto mb-4 h-12 w-12 text-fire" />
        <h1 className="text-2xl font-bold text-white mb-2">Check your inbox</h1>
        <p className="text-slate-400 text-sm leading-7">
          We sent a sign-in link to <strong className="text-white">{sentEmail}</strong>.
        </p>
      </div>
    );
  }

  const inputCls = "w-full rounded-full border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-slate-500 text-sm focus:border-fire focus:outline-none";
  const labelCls = "block text-sm font-medium text-white/80 mb-1";

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
      <div className="flex gap-2 mb-6 rounded-full border border-white/10 p-1 bg-white/5">
        {(["driver","workshop"] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setError(""); }}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${tab === t ? "bg-fire text-white" : "text-white/60 hover:text-white"}`}>
            {t === "driver" ? "I'm a driver" : "I have a workshop"}
          </button>
        ))}
      </div>

      {tab === "driver" ? (
        <form onSubmit={handleDriver} className="space-y-4">
          <h2 className="text-xl font-bold text-white">Start tracking your car&apos;s health</h2>
          <p className="text-slate-400 text-sm">Free to join. No deposit. No pressure.</p>
          <div><label className={labelCls}>Full name</label><input className={inputCls} value={driverName} onChange={e=>setDriverName(e.target.value)} placeholder="Jane Smith" /></div>
          <div><label className={labelCls}>Email address</label><input type="email" required className={inputCls} value={driverEmail} onChange={e=>setDriverEmail(e.target.value)} placeholder="jane@example.com" /></div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={driverTerms} onChange={e=>setDriverTerms(e.target.checked)} className="mt-0.5" />
            <span className="text-sm text-slate-400">I agree to the <Link href="/terms" className="text-fire underline">terms of service</Link></span>
          </label>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-fire px-6 py-3 text-sm font-semibold text-white shadow-glow-fire hover:bg-fire/90 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {loading ? "Sending…" : "Create free account"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleWorkshop} className="space-y-4">
          <h2 className="text-xl font-bold text-white">Register your workshop</h2>
          <p className="text-slate-400 text-sm">Start receiving qualified leads from drivers near you.</p>
          <div><label className={labelCls}>Workshop name</label><input required className={inputCls} value={bizName} onChange={e=>setBizName(e.target.value)} placeholder="Joe's Auto Workshop" /></div>
          <div><label className={labelCls}>Your name</label><input className={inputCls} value={contactName} onChange={e=>setContactName(e.target.value)} placeholder="Joe Smith" /></div>
          <div><label className={labelCls}>Email address</label><input type="email" required className={inputCls} value={wsEmail} onChange={e=>setWsEmail(e.target.value)} placeholder="joe@workshop.co.za" /></div>
          <div><label className={labelCls}>Phone number</label><input className={inputCls} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+27 81 234 5678" /></div>
          <div><label className={labelCls}>City</label>
            <select required value={city} onChange={e=>setCity(e.target.value)} className={inputCls}>
              <option value="">Select city…</option>
              {SA_CITIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Services offered</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SERVICES.map(s=>(
                <button key={s} type="button" onClick={()=>toggleService(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${services.includes(s) ? "bg-fire border-fire text-white" : "border-white/20 text-white/70 hover:border-white/40"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={wsTerms} onChange={e=>setWsTerms(e.target.checked)} className="mt-0.5" />
            <span className="text-sm text-slate-400">I agree to the <Link href="/terms" className="text-fire underline">terms of service</Link></span>
          </label>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-fire px-6 py-3 text-sm font-semibold text-white shadow-glow-fire hover:bg-fire/90 disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {loading ? "Sending…" : "Register workshop"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account? <Link href="/login" className="text-fire underline">Sign in</Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-white">My Bonnet</span>
        </div>
        <Suspense fallback={null}>
          <SignupContent />
        </Suspense>
      </div>
    </div>
  );
}
