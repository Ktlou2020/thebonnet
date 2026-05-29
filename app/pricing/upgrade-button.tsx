"use client";

import { useState } from "react";

export function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/billing/initialize", { method: "POST" });
    if (res.ok) {
      const data = (await res.json()) as { authorizationUrl?: string };
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
        return;
      }
    }
    setLoading(false);
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="block w-full rounded-full bg-fire py-3 text-center text-sm font-semibold text-white shadow-glow-fire transition hover:bg-fire/90 disabled:opacity-60"
    >
      {loading ? "Redirecting..." : "Upgrade to Plus"}
    </button>
  );
}
