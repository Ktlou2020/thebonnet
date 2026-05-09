import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-slate-950">Page not found</h1>
      <p className="mt-4 text-lg leading-8 text-slate-600">The route may not exist in this starter repo yet, but the platform structure is ready for expansion.</p>
      <Link href="/" className="mt-8 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white">
        Back home
      </Link>
    </div>
  );
}
