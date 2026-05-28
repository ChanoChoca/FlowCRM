"use client";

import type { DashboardAdmin } from "@/types/dashboard";
import { AlertCircle, UserMinus, UserPlus, Users, UserX } from "lucide-react";
import ActividadTable from "../ActividadTable";
import DonutChart from "../charts/DonutChart";
import VentasAreaChart from "../charts/VentasAreaChart";
import { fmtNumber } from "../utils";
import AlertBanner from "../widgets/AlertBanner";
import KpiCardWidget from "../widgets/KpiCardWidget";
import QuickActions from "../widgets/QuickActions";
import StatsDebitoWidget from "../widgets/StatsDebitoWidget";

export default function AdminView({ data }: { data: DashboardAdmin }) {
  const stats = data.statsUsuarios;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
          {data.saludo}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {data.fechaActual}
        </p>
        {data.alertas.length > 0 && (
          <div className="mt-3">
            <AlertBanner alertas={data.alertas} />
          </div>
        )}
      </div>

      <div className="stagger-children grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KpiCardWidget data={data.ventasSinObservaciones} />
        <KpiCardWidget data={data.usuariosActivos} />
        <KpiCardWidget data={data.usuariosInactivos} />
        <KpiCardWidget data={data.usuariosIncompletos} />
        <KpiCardWidget data={data.altasMes} />
        <KpiCardWidget data={data.bajasMes} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatBox
          icon={<Users className="h-5 w-5 text-emerald-600" />}
          bg="bg-emerald-50"
          label="Activos"
          value={stats.activos}
        />
        <StatBox
          icon={<UserX className="h-5 w-5 text-neutral-500" />}
          bg="bg-neutral-100"
          label="Inactivos"
          value={stats.inactivos}
        />
        <StatBox
          icon={<UserPlus className="h-5 w-5 text-blue-600" />}
          bg="bg-blue-50"
          label="Altas/mes"
          value={stats.altasMes}
        />
        <StatBox
          icon={<UserMinus className="h-5 w-5 text-red-500" />}
          bg="bg-red-50"
          label="Bajas/mes"
          value={stats.bajasMes}
        />
        <StatBox
          icon={<AlertCircle className="h-5 w-5 text-amber-600" />}
          bg="bg-amber-50"
          label="Incompletos"
          value={stats.incompletos}
        />
        <StatBox
          icon={<UserX className="h-5 w-5 text-amber-600" />}
          bg="bg-amber-50"
          label="Sin login 30d"
          value={stats.sinLoginUltimos30Dias}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <VentasAreaChart
            data={data.ventasDiariasEsteMes}
            title="Ventas diarias este mes"
          />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-2">
          <DonutChart
            data={data.distribucionMetodosPago}
            title="Métodos de pago"
          />
          <StatsDebitoWidget data={data.statsDebito} />
        </div>
      </div>

      <ActividadTable />

      <QuickActions acciones={data.accionesRapidas} />
    </div>
  );
}

function StatBox({
  icon,
  bg,
  label,
  value,
}: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white/80 p-3 backdrop-blur-sm transition-all hover:shadow-md dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg} dark:opacity-80`}
      >
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
          {fmtNumber(value)}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
      </div>
    </div>
  );
}
