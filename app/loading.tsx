export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-fire" />
      <p className="text-sm font-medium text-slate-500">Loading My Bonnet…</p>
    </div>
  );
}
