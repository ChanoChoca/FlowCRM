"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import type { KpiCard } from "@/types/dashboard";
import { useCountUp } from "../hooks";
import { estadoColor, tendenciaColor, fmtNumber, fmtPct } from "../utils";

export default function KpiCardWidget({ data }: { data: KpiCard }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const animatedValue = useCountUp(data.valor);
  const colors = estadoColor(data.estado);
  const tColor = tendenciaColor(data.tendenciaPct);

  return (
    <div
      className={`relative rounded-2xl border ${colors.border} ${colors.bg} p-5 backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{data.label}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${colors.text}`}>
        {fmtNumber(animatedValue)}
      </p>

      {data.tendenciaPct !== null && (
        <div className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${tColor}`}>
          {data.tendenciaPct > 0 ? (
            <TrendingUp className="h-4 w-4" />
          ) : data.tendenciaPct < 0 ? (
            <TrendingDown className="h-4 w-4" />
          ) : (
            <Minus className="h-4 w-4" />
          )}
          <span>{fmtPct(data.tendenciaPct)}</span>
          <span className="text-neutral-400 dark:text-neutral-500">vs periodo ant.</span>
        </div>
      )}

      {data.tooltip && showTooltip && (
        <div className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-neutral-900 px-3.5 py-2.5 text-xs text-white shadow-xl dark:bg-neutral-800 dark:shadow-black/40">
          <div className="flex items-center gap-1.5">
            <Info className="h-3 w-3 shrink-0 text-neutral-400" />
            {data.tooltip}
          </div>
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-800" />
        </div>
      )}
    </div>
  );
}
