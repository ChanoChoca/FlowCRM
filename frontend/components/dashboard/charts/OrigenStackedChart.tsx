"use client";

import type { OrigenTendenciaDia } from "@/types/dashboard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmtDateShort } from "../utils";

type Props = {
  data: OrigenTendenciaDia[];
  title?: string;
};

export default function OrigenStackedChart({ data, title }: Props) {
  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      {title && (
        <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          {title}
        </h3>
      )}
      <div className="h-64">
        <BarChart
          data={data}
          width="100%"
          height="100%"
          responsive={true}
          margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-neutral-100 dark:stroke-neutral-800"
          />
          <XAxis
            dataKey="fecha"
            tickFormatter={fmtDateShort}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            labelFormatter={(label) => fmtDateShort(String(label))}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              fontSize: 13,
            }}
          />
          <Legend
            iconType="square"
            iconSize={10}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar
            dataKey="ventasCrm"
            name="CRM"
            stackId="origen"
            fill="#6366f1"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="ventasPowerApp"
            name="PowerApp"
            stackId="origen"
            fill="#a855f7"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </div>
    </div>
  );
}
