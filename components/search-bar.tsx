"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type Result = {
  id: string;
  name: string;
  city: string;
  slug: string;
  service: string;
};

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { results: Result[] };
      setResults(data.results);
      setOpen(true);
    } catch {
      // Silently ignore search errors
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative hidden md:block">
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2">
        <Search className="h-4 w-4 text-white/50" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query) {
              router.push(`/mechanics?q=${encodeURIComponent(query)}`);
              setOpen(false);
            }
          }}
          placeholder="Search workshops, cities…"
          className="w-48 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 top-11 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                router.push(`/mechanics/${r.slug}`);
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {r.name}
                </div>
                <div className="text-xs text-slate-500">{r.city}</div>
              </div>
              {r.service && (
                <span className="shrink-0 rounded-full bg-fire/10 px-2 py-0.5 text-xs font-medium text-fire">
                  {r.service}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
