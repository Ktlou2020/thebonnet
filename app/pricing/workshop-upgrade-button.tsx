"use client";

import { useState } from "react";

export function WorkshopUpgradeButton({
  plan,
  label,
}: {
  plan: string;
  label: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/billing/workshop/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
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
      {loading ? "Redirecting…" : label}
    </button>
  );
}
