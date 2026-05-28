"use client";

import type { VentasPorDia } from "@/types/dashboard";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtDateShort } from "../utils";

type Props = {
  data: VentasPorDia[];
  title?: string;
};

export default function VentasAreaChart({ data, title }: Props) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      {title && (
        <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          {title}
        </h3>
      )}
      <div className="h-64">
        <AreaChart
          data={data}
          width="100%"
          height="100%"
          responsive={true}
          margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
        >
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-neutral-100 dark:stroke-neutral-800"
          />
          <XAxis
            dataKey="fecha"
            tickFormatter={fmtDateShort}
            tick={{ fontSize: 11 }}
            className="fill-neutral-400 dark:fill-neutral-500"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            className="fill-neutral-400 dark:fill-neutral-500"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            labelFormatter={(label) => fmtDateShort(String(label))}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--color-neutral-200)",
              fontSize: 13,
              backgroundColor: "var(--color-white)",
            }}
            formatter={(value, name) => [
              value,
              name === "cantidad" ? "Actual" : "Anterior",
            ]}
          />
          <Area
            type="monotone"
            dataKey="cantidadAnterior"
            stroke="#9ca3af"
            strokeDasharray="5 5"
            fill="none"
            strokeWidth={1.5}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="cantidad"
            stroke="#6366f1"
            fill="url(#colorActual)"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 5,
              fill: "#6366f1",
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </div>
      <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 rounded bg-indigo-500" />
          Periodo actual
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 rounded border-t border-dashed border-neutral-400 dark:border-neutral-500" />
          Periodo anterior
        </div>
      </div>
    </div>
  );
}
