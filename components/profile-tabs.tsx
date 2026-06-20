"use client";

import { useState } from "react";

export function ProfileTabs({
  tabs,
}: {
  tabs: { id: string; label: string; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-5 py-3 text-sm font-semibold transition-colors ${
              active === t.id ? "border-b-2 border-fire text-fire" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="py-8">{current?.content}</div>
    </div>
  );
}
