import type { Metadata } from "next";
import Link from "next/link";
import { Search, MessageSquare, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "About My Bonnet — SA's Mechanic Marketplace",
  description:
    "Learn how My Bonnet connects South African drivers with trusted, vetted automotive workshops. Our mission, story, and how it works.",
};

const steps = [
  {
    icon: Search,
    title: "Describe your issue",
    description:
      "Tell us what's wrong with your vehicle — brake noise, oil service, engine warning light. Our platform helps you articulate the problem clearly so workshops can give you an accurate quote.",
  },
  {
    icon: MessageSquare,
    title: "Get quotes from workshops",
    description:
      "Relevant, verified workshops in your area receive your request and respond with quotes. No cold calls, no guesswork — just clear pricing from real mechanics.",
  },
  {
    icon: CheckCircle,
    title: "Choose your workshop",
    description:
      "Compare quotes, read verified reviews, and choose the workshop that fits your needs and budget. Book directly and get back on the road with confidence.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-ink text-white px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-fire font-semibold uppercase tracking-widest text-sm mb-4">About My Bonnet</p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            South Africa&rsquo;s mechanic marketplace.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300 max-w-2xl mx-auto">
            We connect drivers with trusted, vetted automotive workshops — making the process of
            finding and booking a mechanic transparent, fair, and stress-free.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/mechanics"
              className="rounded-full bg-fire px-7 py-3.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
            >
              Find a mechanic
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Our story */}
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-soft">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Our story</h2>
          <div className="space-y-5 text-slate-600 leading-8 text-base">
            <p>
              Finding a trustworthy mechanic in South Africa has always been a word-of-mouth game.
              Drivers rely on friends, family, or luck — and when something goes wrong, there&rsquo;s
              no reliable way to compare workshops, understand pricing, or verify quality.
            </p>
            <p>
              My Bonnet was built to fix that. We created a marketplace where workshops earn
              business by being transparent and where drivers can make informed choices backed by
              real reviews and verified credentials. We believe the best mechanics deserve to be found,
              and that drivers deserve to know exactly who is working on their car.
            </p>
            <p>
              We started in Cape Town and Johannesburg and are expanding across South Africa.
              Whether you need a quick oil service in Pretoria or a major engine repair in Durban,
              My Bonnet is here to help you find the right workshop for the job.
            </p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="mx-auto max-w-4xl px-6 pb-16 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">How it works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft text-center"
              >
                <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-fire/10">
                  <Icon className="h-7 w-7 text-fire" />
                </div>
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Step {i + 1}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-7">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mission */}
      <div className="bg-ink text-white">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-5">Our mission</h2>
          <p className="text-slate-300 leading-8 text-lg max-w-2xl mx-auto">
            To make every South African driver confident that their vehicle is in good hands — and to
            build a marketplace where the best workshops thrive because of their quality, not their
            marketing budget.
          </p>
          <div className="mt-10">
            <Link
              href="/request-quote"
              className="rounded-full bg-fire px-8 py-4 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
            >
              Request a free quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
