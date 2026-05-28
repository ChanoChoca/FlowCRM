"use client";

import type { HeatmapDia } from "@/types/dashboard";

const LEVEL_COLORS = [
  "bg-neutral-100 dark:bg-neutral-800",
  "bg-emerald-100 dark:bg-emerald-900/60",
  "bg-emerald-300 dark:bg-emerald-700/70",
  "bg-emerald-500 dark:bg-emerald-500",
  "bg-emerald-700 dark:bg-emerald-400",
];

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

function getWeekday(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return (d.getDay() + 6) % 7; // 0=Mon
}

function groupByWeek(data: HeatmapDia[]) {
  const weeks: (HeatmapDia | null)[][] = [];
  let currentWeek: (HeatmapDia | null)[] = [];

  if (data.length > 0) {
    const firstDay = getWeekday(data[0].fecha);
    for (let i = 0; i < firstDay; i++) currentWeek.push(null);
  }

  for (const d of data) {
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return weeks;
}

type Props = {
  data: HeatmapDia[];
  title?: string;
};

export default function Heatmap({ data, title }: Props) {
  const weeks = groupByWeek(data);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      {title && (
        <h3 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          {title}
        </h3>
      )}
      <div className="flex gap-1">
        <div className="flex flex-col gap-1 pr-1 pt-0">
          {DAY_LABELS.map((l) => (
            <div
              key={l}
              className="flex h-4 w-4 items-center justify-center text-[10px] text-neutral-400 dark:text-neutral-500"
            >
              {l}
            </div>
          ))}
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`h-4 w-4 rounded-sm ${
                    day
                      ? LEVEL_COLORS[Math.min(day.nivel, 4)]
                      : "bg-transparent"
                  }`}
                  title={
                    day
                      ? `${day.fecha}: ${day.cantidad} venta${day.cantidad !== 1 ? "s" : ""}`
                      : undefined
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-[10px] text-neutral-400 dark:text-neutral-500">
        <span>Menos</span>
        {LEVEL_COLORS.map((c, i) => (
          <div key={i} className={`h-3 w-3 rounded-sm ${c}`} />
        ))}
        <span>Más</span>
      </div>
    </div>
  );
}
