"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Star,
  X,
  XCircle,
} from "lucide-react";
import { SERVICE_AREAS } from "@/lib/areas";

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkshopRow = {
  id: string;
  name: string;
  slug: string;
  city: string;
  suburb: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isVerified: boolean;
  status: string;
  featured: boolean;
  subscriptionPlan: string | null;
  createdAt: string;
  reviewCount: number;
  leadCount: number;
};

type AddWorkshopForm = {
  name: string;
  city: string;
  suburb: string;
  addressLine1: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  description: string;
  hoursText: string;
  mobileService: boolean;
  featured: boolean;
  status: "PENDING" | "VERIFIED";
};

const EMPTY_FORM: AddWorkshopForm = {
  name: "",
  city: SERVICE_AREAS[0],
  suburb: "",
  addressLine1: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  description: "",
  hoursText: "",
  mobileService: false,
  featured: false,
  status: "VERIFIED",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(w: WorkshopRow) {
  if (w.isVerified)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
        <CheckCircle className="h-3 w-3" /> Verified
      </span>
    );
  if (w.status === "REJECTED")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
        <XCircle className="h-3 w-3" /> Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
      <AlertTriangle className="h-3 w-3" /> Pending
    </span>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-fire focus:ring-2 focus:ring-fire/20";

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminWorkshopsPage() {
  const [workshops, setWorkshops] = useState<WorkshopRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "verified" | "rejected">("all");

  // Per-row action state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Rejection modal
  const [rejectTarget, setRejectTarget] = useState<WorkshopRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // Add workshop panel
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addForm, setAddForm] = useState<AddWorkshopForm>(EMPTY_FORM);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  // Bulk tools accordion
  const [toolsOpen, setToolsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"scrape" | "seed" | null>(null);

  // Import from Google Places
  const [importCity, setImportCity] = useState<string>(SERVICE_AREAS[0]);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [importError, setImportError] = useState("");

  // Scrape / Seed results
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<string>("");
  const [bulkError, setBulkError] = useState("");

  // ── Data loading ────────────────────────────────────────────────────────────

  async function fetchWorkshops() {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/admin/workshops");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to load workshops");
      setWorkshops(await res.json() as WorkshopRow[]);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchWorkshops(); }, []);

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (showAddPanel && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowAddPanel(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAddPanel]);

  // ── Verify / Reject ─────────────────────────────────────────────────────────

  async function handleVerify(id: string) {
    setActionLoading(id + "-verify");
    await fetch(`/api/admin/workshops/${id}/verify`, { method: "POST" });
    setActionLoading(null);
    fetchWorkshops();
  }

  function openRejectModal(w: WorkshopRow) {
    setRejectTarget(w);
    setRejectReason("");
  }

  async function submitReject() {
    if (!rejectTarget) return;
    setRejectLoading(true);
    await fetch(`/api/admin/workshops/${rejectTarget.id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: rejectReason }),
    });
    setRejectLoading(false);
    setRejectTarget(null);
    fetchWorkshops();
  }

  // ── Manual add ──────────────────────────────────────────────────────────────

  function setField<K extends keyof AddWorkshopForm>(key: K, value: AddWorkshopForm[K]) {
    setAddForm((f) => ({ ...f, [key]: value }));
  }

  async function handleAddWorkshop(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.city) {
      setAddError("Name and city are required.");
      return;
    }
    setAddLoading(true);
    setAddError("");
    setAddSuccess("");
    try {
      const res = await fetch("/api/admin/workshops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json() as { error?: string; slug?: string };
      if (!res.ok) {
        setAddError(data.error ?? "Failed to create workshop.");
      } else {
        setAddSuccess(`Workshop created! Slug: /${data.slug}`);
        setAddForm(EMPTY_FORM);
        fetchWorkshops();
      }
    } catch {
      setAddError("Network error. Please try again.");
    } finally {
      setAddLoading(false);
    }
  }

  // ── Bulk tools ──────────────────────────────────────────────────────────────

  async function handleBulkAction(type: "scrape" | "seed") {
    setConfirmAction(null);
    setBulkLoading(true);
    setBulkResult("");
    setBulkError("");
    try {
      const url = type === "scrape" ? "/api/admin/scrape-all" : "/api/admin/seed-workshops";
      const res = await fetch(url, { method: "POST" });
      const data = await res.json() as { totalImported?: number; imported?: number; totalSkipped?: number; skipped?: number; error?: string };
      if (!res.ok) {
        setBulkError(data.error ?? `${type} failed`);
      } else {
        const imported = data.totalImported ?? data.imported ?? 0;
        const skipped = data.totalSkipped ?? data.skipped ?? 0;
        setBulkResult(`Done — ${imported} imported, ${skipped} skipped.`);
        fetchWorkshops();
      }
    } catch (e) {
      setBulkError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setBulkLoading(false);
    }
  }

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
      const data = await res.json() as { imported?: number; skipped?: number; error?: string };
      if (!res.ok) {
        setImportError(data.error ?? "Import failed.");
      } else {
        setImportResult({ imported: data.imported ?? 0, skipped: data.skipped ?? 0 });
        fetchWorkshops();
      }
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setImportLoading(false);
    }
  }

  // ── Filtered list ────────────────────────────────────────────────────────────

  const filtered = workshops.filter((w) => {
    const matchesSearch =
      !search ||
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "verified" && w.isVerified) ||
      (filterStatus === "pending" && !w.isVerified && w.status !== "REJECTED") ||
      (filterStatus === "rejected" && w.status === "REJECTED");
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: workshops.length,
    pending: workshops.filter((w) => !w.isVerified && w.status !== "REJECTED").length,
    verified: workshops.filter((w) => w.isVerified).length,
    rejected: workshops.filter((w) => w.status === "REJECTED").length,
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-ink text-white px-6 py-8 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workshops</h1>
            <p className="mt-1 text-sm text-slate-400">Manage listings, verify workshops, and add new ones</p>
          </div>
          <button
            onClick={() => { setShowAddPanel(true); setAddError(""); setAddSuccess(""); }}
            className="inline-flex items-center gap-2 rounded-full bg-fire px-6 py-3 text-sm font-bold text-white shadow-glow-fire transition hover:bg-fire/90"
          >
            <Plus className="h-4 w-4" /> Add Workshop
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", value: stats.total, color: "text-slate-800" },
            { label: "Pending", value: stats.pending, color: "text-amber-600" },
            { label: "Verified", value: stats.verified, color: "text-emerald-600" },
            { label: "Rejected", value: stats.rejected, color: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bulk tools accordion */}
        <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white shadow-soft overflow-hidden">
          <button
            className="flex w-full items-center justify-between px-6 py-4 text-left"
            onClick={() => setToolsOpen((o) => !o)}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Download className="h-4 w-4 text-slate-400" />
              Bulk Import Tools
            </div>
            {toolsOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </button>

          {toolsOpen && (
            <div className="border-t border-slate-100 px-6 pb-6 pt-4 grid gap-4 sm:grid-cols-3">
              {/* Scrape */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-800">OpenStreetMap Scrape</div>
                <p className="mt-1 text-xs text-slate-500">Pull workshops from OSM across all Joburg suburbs. Saves as PENDING.</p>
                <button
                  onClick={() => setConfirmAction("scrape")}
                  disabled={bulkLoading}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:opacity-50"
                >
                  <RefreshCw className="h-3 w-3" /> Scrape All Areas
                </button>
              </div>
              {/* Seed */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-800">Seed Curated Data</div>
                <p className="mt-1 text-xs text-slate-500">Insert the static JSON dataset of curated workshops.</p>
                <button
                  onClick={() => setConfirmAction("seed")}
                  disabled={bulkLoading}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-700 disabled:opacity-50"
                >
                  <RefreshCw className="h-3 w-3" /> Seed Workshops
                </button>
              </div>
              {/* Google Places */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-800">Google Places Import</div>
                <p className="mt-1 text-xs text-slate-500">Fetch 4★+ workshops for a single suburb using the Places API.</p>
                <form onSubmit={handleImport} className="mt-3 flex flex-col gap-2">
                  <select
                    value={importCity}
                    onChange={(e) => setImportCity(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-fire/30"
                  >
                    {SERVICE_AREAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button
                    type="submit"
                    disabled={importLoading}
                    className="inline-flex items-center gap-1.5 rounded-full bg-fire px-4 py-2 text-xs font-bold text-white transition hover:bg-fire/90 disabled:opacity-50"
                  >
                    {importLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                    {importLoading ? "Importing…" : "Import"}
                  </button>
                </form>
                {importResult && (
                  <p className="mt-2 text-xs text-emerald-700 font-medium">{importResult.imported} imported, {importResult.skipped} skipped</p>
                )}
                {importError && <p className="mt-2 text-xs text-red-600">{importError}</p>}
              </div>

              {(bulkLoading || bulkResult || bulkError) && (
                <div className="sm:col-span-3">
                  {bulkLoading && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Loader2 className="h-4 w-4 animate-spin" /> Running…
                    </div>
                  )}
                  {bulkResult && <p className="text-sm font-medium text-emerald-700">{bulkResult}</p>}
                  {bulkError && <p className="text-sm text-red-600">{bulkError}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search + filter bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or suburb…"
              className="w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fire/20"
            />
          </div>
          <div className="flex gap-2 text-xs font-semibold">
            {(["all", "pending", "verified", "rejected"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`rounded-full px-3 py-1.5 transition capitalize ${filterStatus === s ? "bg-fire text-white shadow-glow-fire" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Workshop table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : fetchError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{fetchError}</div>
        ) : (
          <div className="overflow-x-auto rounded-[2rem] border border-slate-200 bg-white shadow-soft">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3.5">Workshop</th>
                  <th className="px-5 py-3.5">Area</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Plan</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-center">Reviews</th>
                  <th className="px-5 py-3.5 text-center">Leads</th>
                  <th className="px-5 py-3.5">Added</th>
                  <th className="px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                      No workshops match your filters.
                    </td>
                  </tr>
                )}
                {filtered.map((w) => (
                  <tr key={w.id} className="border-b border-slate-50 align-middle transition hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 max-w-[200px] truncate">{w.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">/{w.slug}</div>
                      {w.featured && (
                        <span className="inline-flex items-center gap-0.5 mt-1 text-xs font-semibold text-gold">
                          <Star className="h-3 w-3 fill-gold" /> Featured
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">{w.city}</div>
                      {w.suburb && <div className="text-xs text-slate-400">{w.suburb}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {w.phone && <div>{w.phone}</div>}
                      {w.email && <div className="truncate max-w-[160px]">{w.email}</div>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {w.subscriptionPlan ?? "FREE"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">{statusBadge(w)}</td>
                    <td className="px-5 py-3.5 text-center font-medium">{w.reviewCount}</td>
                    <td className="px-5 py-3.5 text-center font-medium">{w.leadCount}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(w.createdAt).toLocaleDateString("en-ZA")}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleVerify(w.id)}
                          disabled={actionLoading === w.id + "-verify" || w.isVerified}
                          className="rounded-full bg-fire px-3 py-1.5 text-xs font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-40"
                        >
                          {actionLoading === w.id + "-verify" ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify"}
                        </button>
                        <button
                          onClick={() => openRejectModal(w)}
                          disabled={actionLoading === w.id + "-reject"}
                          className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
                        >
                          Reject
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

      {/* ── Add Workshop slide panel ────────────────────────────────────────────── */}
      {showAddPanel && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddPanel(false)} />
          {/* Panel */}
          <div ref={panelRef} className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">Add Workshop Manually</h2>
              <button onClick={() => setShowAddPanel(false)} className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddWorkshop} className="flex-1 px-6 py-6 space-y-5">

              {addSuccess && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-medium text-emerald-700">
                  {addSuccess}
                </div>
              )}
              {addError && (
                <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {addError}
                </div>
              )}

              <fieldset className="space-y-4">
                <legend className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Basic info</legend>

                <label className="block text-sm font-medium text-slate-700">
                  Workshop name *
                  <input
                    value={addForm.name}
                    onChange={(e) => setField("name", e.target.value)}
                    required
                    placeholder="e.g. Sandton Auto Repairs"
                    className={`mt-1 ${inputCls}`}
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Suburb / Area *
                    <select
                      value={addForm.city}
                      onChange={(e) => setField("city", e.target.value)}
                      className={`mt-1 ${inputCls}`}
                    >
                      {SERVICE_AREAS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Sub-area (optional)
                    <input
                      value={addForm.suburb}
                      onChange={(e) => setField("suburb", e.target.value)}
                      placeholder="e.g. Morningside"
                      className={`mt-1 ${inputCls}`}
                    />
                  </label>
                </div>

                <label className="block text-sm font-medium text-slate-700">
                  Street address
                  <input
                    value={addForm.addressLine1}
                    onChange={(e) => setField("addressLine1", e.target.value)}
                    placeholder="e.g. 12 Main Road, Sandton"
                    className={`mt-1 ${inputCls}`}
                  />
                </label>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Contact</legend>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Phone
                    <input
                      value={addForm.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      placeholder="011 xxx xxxx"
                      className={`mt-1 ${inputCls}`}
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    WhatsApp
                    <input
                      value={addForm.whatsapp}
                      onChange={(e) => setField("whatsapp", e.target.value)}
                      placeholder="071 xxx xxxx"
                      className={`mt-1 ${inputCls}`}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Email
                    <input
                      type="email"
                      value={addForm.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="workshop@email.com"
                      className={`mt-1 ${inputCls}`}
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Website
                    <input
                      value={addForm.website}
                      onChange={(e) => setField("website", e.target.value)}
                      placeholder="https://…"
                      className={`mt-1 ${inputCls}`}
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset className="space-y-4">
                <legend className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Details</legend>

                <label className="block text-sm font-medium text-slate-700">
                  Description
                  <textarea
                    value={addForm.description}
                    onChange={(e) => setField("description", e.target.value)}
                    rows={3}
                    placeholder="Short description of the workshop's speciality…"
                    className={`mt-1 ${inputCls} resize-none`}
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Trading hours
                  <input
                    value={addForm.hoursText}
                    onChange={(e) => setField("hoursText", e.target.value)}
                    placeholder="Mon–Fri 7:30–17:00, Sat 8:00–13:00"
                    className={`mt-1 ${inputCls}`}
                  />
                </label>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addForm.mobileService}
                      onChange={(e) => setField("mobileService", e.target.checked)}
                      className="h-4 w-4 rounded accent-fire"
                    />
                    Mobile service
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addForm.featured}
                      onChange={(e) => setField("featured", e.target.checked)}
                      className="h-4 w-4 rounded accent-fire"
                    />
                    Featured listing
                  </label>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Initial status</legend>
                <div className="flex gap-3">
                  {(["VERIFIED", "PENDING"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setField("status", s)}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${addForm.status === s ? "border-fire bg-fire/5 text-fire" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                    >
                      {s === "VERIFIED" ? "✓ Verified (live)" : "Pending review"}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-slate-100 mt-6">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-fire py-3 text-sm font-bold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-50"
                >
                  {addLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {addLoading ? "Creating…" : "Create Workshop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Rejection modal ────────────────────────────────────────────────────── */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Reject Workshop</h3>
                <p className="mt-1 text-sm text-slate-500 truncate max-w-xs">{rejectTarget.name}</p>
              </div>
              <button onClick={() => setRejectTarget(null)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Reason <span className="text-slate-400 font-normal">(optional)</span>
              <textarea
                autoFocus
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="e.g. Duplicate listing, incorrect details…"
                className={`mt-1 ${inputCls} resize-none`}
              />
            </label>
            <div className="mt-4 flex gap-3 justify-end">
              <button
                onClick={() => setRejectTarget(null)}
                className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                disabled={rejectLoading}
                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {rejectLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                {rejectLoading ? "Rejecting…" : "Reject Workshop"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation modal for destructive bulk ops ───────────────────────── */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {confirmAction === "scrape" ? "Scrape All Areas?" : "Seed Workshop Data?"}
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-6">
              {confirmAction === "scrape"
                ? "This will fetch workshop data from OpenStreetMap for all 16 Joburg suburbs and upsert them into the database."
                : "This will insert the curated static workshop dataset. Existing workshops with the same slug will be updated."}
            </p>
            <div className="mt-5 flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction(confirmAction)}
                className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
