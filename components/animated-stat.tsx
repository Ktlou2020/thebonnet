"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedStat({
  value,
  prefix = "",
  suffix = "",
  label,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}) {
  const [display, setDisplay] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const duration = 1400;
          const start = performance.now();
          const isDecimal = !Number.isInteger(value);
          const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            const raw = eased * value;
            setDisplay(isDecimal ? Math.round(raw * 10) / 10 : Math.round(raw));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-black tracking-tight text-white sm:text-5xl">
        {prefix}
        {display.toLocaleString("en-ZA")}
        {suffix}
      </div>
      <div className="mt-2 text-sm text-slate-400">{label}</div>
    </div>
  );
}
