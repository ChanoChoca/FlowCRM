"use client";

import type { DashboardFiltro, DashboardLider } from "@/types/dashboard";
import { Users, UserX } from "lucide-react";
import ActividadTable from "../ActividadTable";
import DonutChart from "../charts/DonutChart";
import GaugeChart from "../charts/GaugeChart";
import OrigenStackedChart from "../charts/OrigenStackedChart";
import TopBarChart from "../charts/TopBarChart";
import VentasAreaChart from "../charts/VentasAreaChart";
import Filtros from "../Filtros";
import { fmtNumber } from "../utils";
import AlertBanner from "../widgets/AlertBanner";
import KpiCardWidget from "../widgets/KpiCardWidget";
import QuickActions from "../widgets/QuickActions";
import StatsDebitoWidget from "../widgets/StatsDebitoWidget";

type Props = {
  data: DashboardLider;
  onFilterChange: (filtro: Partial<DashboardFiltro>) => void;
  onFilterReset: () => void;
};

export default function LiderView({
  data,
  onFilterChange,
  onFilterReset,
}: Props) {
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
        <div className="mt-3">
          <Filtros
            filtro={data.filtroActivo}
            onChange={onFilterChange}
            onReset={onFilterReset}
          />
        </div>
      </div>

      <div className="stagger-children grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCardWidget data={data.ventasHoy} />
        <KpiCardWidget data={data.ventasSemana} />
        <KpiCardWidget data={data.ventasMes} />
        <KpiCardWidget data={data.porcentajeDebitoAuto} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <GaugeChart data={data.tasaConversion} />
        </div>
        <div className="lg:col-span-2">
          <StatsDebitoWidget data={data.statsDebito} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
        <TopBarChart data={data.ventasPorCentral} title="Ventas por central" />
        <DonutChart data={data.ventasPorProducto} title="Ventas por producto" />
        <DonutChart data={data.ventasPorPromo} title="Ventas por promo" />
        <DonutChart data={data.distribucionTurno} title="Distribución AM/PM" />
        <TopBarChart
          data={data.ventasPorProvincia}
          title="Ventas por provincia"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <VentasAreaChart
          data={data.evolucionUltimos90Dias}
          title="Evolución de ventas (90 días)"
        />
        <OrigenStackedChart
          data={data.origenVentas14Dias}
          title="Origen: CRM vs PowerApp (14 días)"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 backdrop-blur-sm transition-all hover:shadow-md dark:border-neutral-700/50 dark:bg-neutral-900/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/50">
            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
              {fmtNumber(data.usuariosActivosConLoginUltimos7Dias)}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Activos últimos 7 días
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/80 p-4 backdrop-blur-sm transition-all hover:shadow-md dark:border-neutral-700/50 dark:bg-neutral-900/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/50">
            <UserX className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
              {fmtNumber(data.usuariosSinLoginUltimos30Dias)}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Sin login 30 días
            </p>
          </div>
        </div>
      </div>

      <ActividadTable />

      <QuickActions acciones={data.accionesRapidas} />
    </div>
  );
}
