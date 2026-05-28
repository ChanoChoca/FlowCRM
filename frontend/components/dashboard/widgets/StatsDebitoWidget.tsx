"use client";

import { CreditCard } from "lucide-react";
import type { StatsDebito } from "@/types/dashboard";
import { useCountUp, useCountUpDecimal } from "../hooks";
import { fmtNumber } from "../utils";

export default function StatsDebitoWidget({ data }: { data: StatsDebito }) {
  const total = useCountUp(data.totalVentas);
  const debito = useCountUp(data.conDebitoAuto);
  const pct = useCountUpDecimal(data.porcentajeDebito, 1);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          Débito automático
        </h3>
      </div>

      <div className="mt-4 flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
          {pct.toFixed(1)}%
        </span>
        <span className="mb-1 text-sm text-neutral-500 dark:text-neutral-400">de las ventas</span>
      </div>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-700"
          style={{ width: `${Math.min(data.porcentajeDebito, 100)}%` }}
        />
      </div>

      <div className="mt-3 flex gap-4 text-xs text-neutral-500 dark:text-neutral-400">
        <span>
          Con débito:{" "}
          <strong className="text-neutral-700 dark:text-neutral-200">{fmtNumber(debito)}</strong>
        </span>
        <span>
          Total:{" "}
          <strong className="text-neutral-700 dark:text-neutral-200">{fmtNumber(total)}</strong>
        </span>
      </div>
    </div>
  );
}
