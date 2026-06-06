"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

const SA_CITIES = [
  "Cape Town",
  "Johannesburg",
  "Pretoria",
  "Durban",
  "Port Elizabeth",
  "Bloemfontein",
  "Nelspruit",
  "Polokwane",
  "East London",
  "Sandton",
];

type WorkshopRow = {
  id: string;
  name: string;
  slug: string;
  city: string;
  isVerified: boolean;
  subscriptionPlan: string | null;
  createdAt: string;
  reviewCount: number;
  leadCount: number;
};

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<WorkshopRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Scrape all cities
  const [scrapeAllLoading, setScrapeAllLoading] = useState(false);
  const [scrapeAllResult, setScrapeAllResult] = useState<{
    totalImported: number;
    totalSkipped: number;
    byCity: { city: string; imported: number; skipped: number }[];
  } | null>(null);
  const [scrapeAllError, setScrapeAllError] = useState("");

  async function handleScrapeAll() {
    setScrapeAllLoading(true);
    setScrapeAllResult(null);
    setScrapeAllError("");
    try {
      const res = await fetch("/api/admin/scrape-all", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setScrapeAllError((data as { error?: string }).error ?? "Scrape failed.");
      } else {
        const data = await res.json() as {
          totalImported: number;
          totalSkipped: number;
          byCity: { city: string; imported: number; skipped: number }[];
        };
        setScrapeAllResult(data);
        fetchWorkshops();
      }
    } catch (err) {
      setScrapeAllError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setScrapeAllLoading(false);
    }
  }

  // Import from Google Places
  const [importCity, setImportCity] = useState(SA_CITIES[0]);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [importError, setImportError] = useState("");

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setImportLoading(true);
    setImportResult(null);
    setImportError("");
    try {
      const res = await fetch("/api/admin/import-workshops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: importCity }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setImportError((data as { error?: string }).error ?? "Import failed.");
      } else {
        const data = (await res.json()) as { imported: number; skipped: number };
        setImportResult(data);
        fetchWorkshops();
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setImportLoading(false);
    }
  }

  async function fetchWorkshops() {
    const res = await fetch("/api/admin/workshops");
    if (!res.ok) {
      setError("Failed to load workshops.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as WorkshopRow[];
    setWorkshops(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchWorkshops();
  }, []);

  async function handleVerify(id: string) {
    setActionLoading(id + "-verify");
    await fetch(`/api/admin/workshops/${id}/verify`, { method: "POST" });
    setActionLoading(null);
    fetchWorkshops();
  }

  async function handleReject(id: string) {
    const reason = prompt("Rejection reason (optional):");
    setActionLoading(id + "-reject");
    await fetch(`/api/admin/workshops/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setActionLoading(null);
    fetchWorkshops();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-ink text-white px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Workshops</h1>
          <p className="mt-1 text-slate-300 text-sm">Verify or reject workshop listings</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        {/* Scrape All SA Workshops */}
        <div className="mb-6 rounded-[2rem] border-2 border-fire/30 bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Scrape All SA Workshops</h2>
              <p className="mt-1 text-sm text-slate-500">
                Pull mechanic workshops from OpenStreetMap across all 10 SA cities in one click — no API key required.
                Results are saved with status <strong>PENDING</strong> for review.
              </p>
            </div>
            <button
              onClick={handleScrapeAll}
              disabled={scrapeAllLoading}
              className="flex shrink-0 items-center gap-2 rounded-full bg-fire px-6 py-3 text-sm font-bold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${scrapeAllLoading ? "animate-spin" : ""}`} />
              {scrapeAllLoading ? "Scraping 10 cities…" : "Scrape All SA Workshops"}
            </button>
          </div>

          {scrapeAllResult && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-emerald-700">
                Done — imported / updated: <strong>{scrapeAllResult.totalImported}</strong>, skipped:{" "}
                <strong>{scrapeAllResult.totalSkipped}</strong>
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {scrapeAllResult.byCity.map((c) => (
                  <div key={c.city} className="rounded-xl bg-slate-50 px-3 py-2 text-xs">
                    <div className="font-semibold text-slate-800">{c.city}</div>
                    <div className="text-slate-500">{c.imported} in · {c.skipped} skip</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {scrapeAllError && (
            <p className="mt-3 text-sm text-red-600">{scrapeAllError}</p>
          )}
        </div>

        {/* Import from Google Places */}
        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Import Workshops from Google Places</h2>
          <p className="mt-1 text-sm text-slate-500">
            Fetch 4-star+ mechanic workshops for a single city and upsert them into the database.
          </p>
          <form onSubmit={handleImport} className="mt-4 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              City
              <select
                value={importCity}
                onChange={(e) => setImportCity(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
              >
                {SA_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={importLoading}
              className="rounded-full bg-fire px-5 py-2.5 text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-50"
            >
              {importLoading ? "Importing…" : "Import from Google Places"}
            </button>
          </form>
          {importResult && (
            <p className="mt-3 text-sm text-emerald-700">
              Done — imported / updated: <strong>{importResult.imported}</strong>, skipped:{" "}
              <strong>{importResult.skipped}</strong>
            </p>
          )}
          {importError && (
            <p className="mt-3 text-sm text-red-600">{importError}</p>
          )}
        </div>

        {loading && <p className="text-slate-500 text-sm">Loading...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {!loading && !error && (
          <div className="overflow-auto rounded-[2rem] border border-slate-200 bg-white shadow-soft">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Reviews</th>
                  <th className="px-4 py-3">Leads</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workshops.length === 0 && (
                  <tr>
                    <td className="px-4 py-10 text-center text-slate-500" colSpan={8}>
                      No workshops found.
                    </td>
                  </tr>
                )}
                {workshops.map((w) => (
                  <tr key={w.id} className="border-b border-slate-100 align-top">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{w.name}</div>
                      <div className="text-xs text-slate-500">/{w.slug}</div>
                    </td>
                    <td className="px-4 py-3">{w.city}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {w.subscriptionPlan ?? "FREE"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {w.isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          <XCircle className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{w.reviewCount}</td>
                    <td className="px-4 py-3">{w.leadCount}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(w.createdAt).toLocaleDateString("en-ZA")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerify(w.id)}
                          disabled={actionLoading === w.id + "-verify" || w.isVerified}
                          className="rounded-full bg-fire px-3 py-1.5 text-xs font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40"
                        >
                          {actionLoading === w.id + "-verify" ? "..." : "Verify"}
                        </button>
                        <button
                          onClick={() => handleReject(w.id)}
                          disabled={actionLoading === w.id + "-reject"}
                          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
                        >
                          {actionLoading === w.id + "-reject" ? "..." : "Reject"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
