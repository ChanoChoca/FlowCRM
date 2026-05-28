"use client";

import { Flame, Award } from "lucide-react";
import type { Racha } from "@/types/dashboard";
import { useCountUp } from "../hooks";

export default function RachaWidget({ data }: { data: Racha }) {
  const days = useCountUp(data.diasConsecutivos);

  if (!data.activa && data.diasConsecutivos === 0) return null;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 backdrop-blur-sm transition-all hover:shadow-md dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
          data.activa ? "bg-orange-50 text-orange-500 dark:bg-orange-950/50 dark:text-orange-400" : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
        }`}
      >
        <Flame className="h-6 w-6" />
      </div>

      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{days}</span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {data.diasConsecutivos === 1 ? "día" : "días"} consecutivos
          </span>
        </div>
        {data.activa && (
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">Racha activa</p>
        )}
      </div>

      {data.proximoBadge && (
        <div className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
          <Award className="h-3.5 w-3.5" />
          {data.proximoBadge}
        </div>
      )}
    </div>
  );
}
