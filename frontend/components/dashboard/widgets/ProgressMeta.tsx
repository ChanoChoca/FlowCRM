"use client";

import { useCountUpDecimal } from "../hooks";
import { fmtNumber } from "../utils";
import type { MetaProgress } from "@/types/dashboard";

const HITOS = [25, 50, 75, 100];

export default function ProgressMeta({ data }: { data: MetaProgress }) {
  const animatedPct = useCountUpDecimal(data.porcentaje, 1);
  const clampedPct = Math.min(data.porcentaje, 100);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Meta mensual</h3>
        <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          {fmtNumber(data.ventasMes)} / {fmtNumber(data.metaMensual)}
        </span>
      </div>

      <div className="relative mt-4">
        <div className="h-4 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              data.porcentaje >= 100
                ? "bg-emerald-500"
                : data.porcentaje >= 70
                  ? "bg-amber-400"
                  : "bg-blue-500"
            } ${data.animarHito ? "animate-hito-pulse" : ""}`}
            style={{ width: `${clampedPct}%` }}
          />
        </div>

        <div className="absolute inset-x-0 top-0 flex h-4 items-center">
          {HITOS.map((h) => (
            <div
              key={h}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${h}%` }}
            >
              <div
                className={`h-2.5 w-2.5 rounded-full border-2 border-white dark:border-neutral-900 ${
                  data.porcentaje >= h ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-600"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-3">
          {HITOS.map((h) => (
            <span
              key={h}
              className={`text-xs font-medium ${
                data.porcentaje >= h ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-400 dark:text-neutral-500"
              }`}
            >
              {h}%
            </span>
          ))}
        </div>
        <span className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
          {animatedPct.toFixed(1)}%
        </span>
      </div>

      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{data.mensajeContextual}</p>

      {data.ventasRestantes > 0 && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Faltan{" "}
          <span className="font-semibold text-neutral-700 dark:text-neutral-200">
            {fmtNumber(data.ventasRestantes)}
          </span>{" "}
          ventas para el próximo hito ({data.proximoHito}%)
        </p>
      )}
    </div>
  );
}
