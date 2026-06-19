import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-ink px-6 text-center">
      <div className="text-8xl font-black text-fire/20">404</div>
      <h1 className="mt-4 text-3xl font-bold text-white">Looks like this page took a wrong turn</h1>
      <p className="mt-3 max-w-md text-slate-400">
        We couldn&apos;t find what you&apos;re looking for. Maybe the mechanic drove off with it.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-fire px-7 py-3.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90"
        >
          Go home
        </Link>
        <Link
          href="/mechanics"
          className="rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/5"
        >
          Find a mechanic
        </Link>
      </div>
    </div>
  );
}
