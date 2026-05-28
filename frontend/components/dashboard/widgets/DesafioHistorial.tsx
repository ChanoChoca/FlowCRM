"use client";

import { getHistorialDesafiosAction } from "@/app/actions/desafios";
import type { DesafioResponse } from "@/types/dashboard";
import { DesafioEstado } from "@/types/enums";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  XCircle,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";

const ESTADO_CONFIG: Record<
  DesafioEstado,
  { label: string; color: string; icon: React.ReactNode }
> = {
  [DesafioEstado.COMPLETADO]: {
    label: "Completado",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    icon: <CheckCircle className="h-3.5 w-3.5" />,
  },
  [DesafioEstado.VENCIDO]: {
    label: "Vencido",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  [DesafioEstado.CANCELADO]: {
    label: "Cancelado",
    color:
      "bg-neutral-100 text-neutral-500 dark:bg-neutral-800/60 dark:text-neutral-400",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  [DesafioEstado.ACTIVO]: {
    label: "Activo",
    color:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
};

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DesafioHistorial() {
  const [historial, setHistorial] = useState<DesafioResponse[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(false);

  const load = () => {
    startTransition(async () => {
      const data = await getHistorialDesafiosAction();
      // Excluye el activo del historial (ya se muestra en la card)
      setHistorial(data.filter((d) => d.estado !== DesafioEstado.ACTIVO));
      setLoaded(true);
    });
  };

  useEffect(() => {
    load();
  }, []);

  if (!loaded && isPending) {
    return (
      <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-neutral-400" />
          <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
            Historial de desafíos
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!loaded) return null;

  const visible = expanded ? historial : historial.slice(0, 3);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            Historial de desafíos
          </h3>
        </div>
        {historial.length > 0 && (
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            {historial.length} {historial.length === 1 ? "desafío" : "desafíos"}
          </span>
        )}
      </div>

      {historial.length === 0 ? (
        <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
          Aún no hay desafíos finalizados. ¡Creá el primero y motivá al equipo!
        </p>
      ) : (
        <>
          <ul className="mt-3 flex flex-col gap-2">
            {visible.map((d) => {
              const cfg = ESTADO_CONFIG[d.estado];
              return (
                <li
                  key={d.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-neutral-100 bg-neutral-50/60 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-800/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">
                      {d.titulo}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {fmtDate(d.fechaInicio)} → {fmtDate(d.fechaVencimiento)}
                      {" · "}
                      <span className="font-medium">
                        {d.progreso}/{d.metaVentas} ventas
                      </span>
                    </p>
                  </div>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium ${cfg.color}`}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </li>
              );
            })}
          </ul>

          {historial.length > 3 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" /> Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" /> Ver {historial.length - 3} más
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
