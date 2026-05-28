"use client";

import type { Segmento } from "@/types/dashboard";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, Cell, Tooltip, XAxis, YAxis } from "recharts";
import { fmtNumber } from "../utils";
import SegmentDrawer from "./SegmentDrawer";

type Props = {
  data: Segmento[];
  title: string;
  topN?: number;
};

const OTROS_LABEL = "Otros";
const PRIMARY = "#6366f1";
const NEUTRAL = "#9ca3af";

export default function TopBarChart({ data, title, topN = 10 }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { rows, totalAll, otrosCount } = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.cantidad - a.cantidad);
    const total = sorted.reduce((s, d) => s + d.cantidad, 0);

    if (sorted.length <= topN) {
      return {
        rows: sorted.map((d) => ({
          ...d,
          isOtros: false,
        })),
        totalAll: total,
        otrosCount: 0,
      };
    }

    const top = sorted.slice(0, topN);
    const rest = sorted.slice(topN);
    const restSum = rest.reduce((s, d) => s + d.cantidad, 0);
    const restPct = total > 0 ? (restSum / total) * 100 : 0;

    return {
      rows: [
        ...top.map((d) => ({ ...d, isOtros: false })),
        {
          nombre: `${OTROS_LABEL} (${rest.length})`,
          cantidad: restSum,
          porcentaje: restPct,
          isOtros: true,
        },
      ],
      totalAll: total,
      otrosCount: rest.length,
    };
  }, [data, topN]);

  const hasOtros = otrosCount > 0;
  const chartHeight = Math.max(220, rows.length * 28);

  return (
    <>
      <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {hasOtros
                ? `Top ${topN} de ${fmtNumber(data.length)} · ${fmtNumber(totalAll)} ventas`
                : `${fmtNumber(data.length)} ${data.length === 1 ? "registro" : "registros"} · ${fmtNumber(totalAll)} ventas`}
            </p>
          </div>
          {data.length > topN && (
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Ver todas
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="mt-3" style={{ height: chartHeight }}>
          <BarChart
            data={rows}
            layout="vertical"
            width="100%"
            height="100%"
            responsive={true}
            margin={{ top: 4, right: 36, bottom: 4, left: 4 }}
            barCategoryGap={6}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="nombre"
              width={140}
              tick={{ fontSize: 11 }}
              className="fill-neutral-500 dark:fill-neutral-400"
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <Tooltip
              cursor={{ fill: "var(--color-neutral-100)", opacity: 0.4 }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--color-neutral-200)",
                fontSize: 13,
                backgroundColor: "var(--color-white)",
              }}
              formatter={(value) => {
                const n = Number(value);
                return [
                  `${fmtNumber(n)} (${
                    totalAll > 0 ? ((n / totalAll) * 100).toFixed(1) : 0
                  }%)`,
                  "Ventas",
                ];
              }}
            />
            <Bar
              dataKey="cantidad"
              radius={[0, 4, 4, 0]}
              label={{
                position: "right",
                fontSize: 11,
                fill: "var(--color-neutral-500)",
                formatter: (value) => fmtNumber(Number(value)),
              }}
            >
              {rows.map((row, i) => (
                <Cell
                  key={i}
                  fill={row.isOtros ? NEUTRAL : PRIMARY}
                  fillOpacity={row.isOtros ? 0.55 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </div>
      </div>

      <SegmentDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={title}
        data={data}
      />
    </>
  );
}
