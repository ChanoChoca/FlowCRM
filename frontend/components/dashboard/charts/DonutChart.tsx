"use client";

import type { Segmento } from "@/types/dashboard";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { CHART_COLORS, fmtNumber } from "../utils";

export default function DonutChart({
  data,
  title,
}: {
  data: Segmento[];
  title: string;
}) {
  const total = data.reduce((s, d) => s + d.cantidad, 0);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60 min-w-0">
      <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
        {title}
      </h3>
      <div className="mt-3 flex flex-col sm:flex-row items-center gap-4">
        <div className="h-44 w-44 shrink-0">
          <PieChart width="100%" height="100%" responsive={true}>
            <Pie
              data={data}
              dataKey="cantidad"
              nameKey="nombre"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [
                `${fmtNumber(Number(value))} (${total > 0 ? ((Number(value) / total) * 100).toFixed(1) : 0}%)`,
                String(name),
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                fontSize: 13,
              }}
            />
          </PieChart>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
          {data.map((seg, i) => (
            <div key={seg.nombre} className="flex items-center gap-2 text-xs">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span className="truncate text-neutral-600 dark:text-neutral-300">
                {seg.nombre}
              </span>
              <span className="ml-auto font-medium text-neutral-800 dark:text-neutral-100">
                {fmtNumber(seg.cantidad)}
              </span>
              <span className="text-neutral-400 dark:text-neutral-500">
                {seg.porcentaje.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
