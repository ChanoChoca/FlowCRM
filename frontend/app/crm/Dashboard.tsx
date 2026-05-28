"use client";

import { getDashboardAction } from "@/app/actions/dashboard";
import { KpiCardSkeleton } from "@/components/Skeleton";
import type {
  DashboardFiltro,
  DashboardSupervisor,
  Dashboard as DashboardType,
} from "@/types/dashboard";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import AdminView from "../../components/dashboard/views/AdminView";
import AsesorView from "../../components/dashboard/views/AsesorView";
import GerenteView from "../../components/dashboard/views/GerenteView";
import JefeView from "../../components/dashboard/views/JefeView";
import LiderView from "../../components/dashboard/views/LiderView";
import SupervisorView from "../../components/dashboard/views/SupervisorView";

export default function Dashboard() {
  const [data, setData] = useState<DashboardType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [filtro, setFiltro] = useState<Partial<DashboardFiltro>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchDashboard = useCallback((f?: Partial<DashboardFiltro>) => {
    startTransition(async () => {
      try {
        setError(null);
        const result = await getDashboardAction(f);
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar el dashboard",
        );
      }
    });
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleFilterChange = useCallback(
    (partial: Partial<DashboardFiltro>) => {
      const next = { ...filtro, ...partial };
      setFiltro(next);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchDashboard(next), 500);
    },
    [filtro, fetchDashboard],
  );

  const handleFilterReset = useCallback(() => {
    setFiltro({});
    fetchDashboard();
  }, [fetchDashboard]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 animate-fade-in-up">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/40">
          <RefreshCw className="h-7 w-7 text-red-500 dark:text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            {error}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            No se pudo cargar el dashboard
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchDashboard(filtro)}
          className="flex items-center gap-2 rounded-xl border border-neutral-200/80 bg-white/60 px-5 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm backdrop-blur transition-all hover:scale-105 hover:shadow-md active:scale-95 dark:border-neutral-700/80 dark:bg-neutral-800/60 dark:text-neutral-200 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in-up">
        <div>
          <div className="h-7 w-48 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700/60" />
          <div className="mt-1.5 h-4 w-32 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700/60" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
          <KpiCardSkeleton />
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-3">
            <div className="h-32 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-700/60" />
            <div className="h-24 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-700/60" />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="h-40 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-700/60" />
          </div>
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-700/60" />
      </div>
    );
  }

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-x-0 top-0 z-10 h-1 overflow-hidden rounded-full bg-neutral-200/60 dark:bg-neutral-800/60">
          <div className="h-full w-1/3 animate-shimmer rounded-full bg-linear-to-r from-indigo-500 via-violet-500 to-indigo-500" />
        </div>
      )}

      {data.type === "ASESOR" && <AsesorView data={data} />}
      {data.type === "SUPERVISOR" && (
        <SupervisorView
          data={data as DashboardSupervisor}
          onDataRefresh={(next) => setData(next)}
        />
      )}
      {data.type === "JEFE_DE_SUPERVISOR" && <JefeView data={data} />}
      {data.type === "GERENTE" && (
        <GerenteView
          data={data}
          onFilterChange={handleFilterChange}
          onFilterReset={handleFilterReset}
        />
      )}
      {data.type === "LIDER" && (
        <LiderView
          data={data}
          onFilterChange={handleFilterChange}
          onFilterReset={handleFilterReset}
        />
      )}
      {data.type === "ADMINISTRACION_RRHH_COBRANZA" && (
        <AdminView data={data} />
      )}
    </div>
  );
}
