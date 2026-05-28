"use client";

import { cancelarDesafioAction } from "@/app/actions/desafios";
import { useToast } from "@/layout/ToastProvider";
import type { DesafioCardResponse, DesafioResponse } from "@/types/dashboard";
import { DesafioEstado } from "@/types/enums";
import { CheckCircle, Clock, Plus, Target, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useCountUp } from "../hooks";
import { fmtNumber } from "../utils";
import CrearDesafioModal from "./CrearDesafioModal";

type Props =
  | { data: DesafioCardResponse | DesafioResponse | null; isSupervisor?: false; onRefresh?: never }
  | { data: DesafioCardResponse | DesafioResponse | null; isSupervisor: true; onRefresh: () => void };

function isFullResponse(
  d: DesafioCardResponse | DesafioResponse,
): d is DesafioResponse {
  return "estado" in d;
}

export default function DesafioCard({ data, isSupervisor, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { show } = useToast();

  const searchParams = useSearchParams();
  const router = useRouter();
  const triggeredRef = useRef(false);
  useEffect(() => {
    if (triggeredRef.current) return;
    if (!isSupervisor) return;
    if (searchParams.get("desafio") !== "nuevo") return;
    triggeredRef.current = true;
    setShowModal(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("desafio");
    const qs = params.toString();
    router.replace(qs ? `/crm?${qs}` : "/crm", { scroll: false });
  }, [searchParams, router, isSupervisor]);

  const progreso = useCountUp(data?.progreso ?? 0);
  const clampedPct = Math.min(data?.porcentaje ?? 0, 100);

  const esActivo =
    data &&
    isFullResponse(data) &&
    data.estado === DesafioEstado.ACTIVO;

  const handleCancelar = () => {
    if (!data?.id) return;
    startTransition(async () => {
      const result = await cancelarDesafioAction(data.id!);
      if (result?.error) {
        show(result.error, "error");
      } else {
        show("Desafío cancelado", "info");
        onRefresh?.();
      }
    });
  };

  // Supervisor sin desafío activo: mostrar CTA para crear
  if (!data && isSupervisor) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex h-full min-h-30 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/60 text-indigo-500 transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 active:scale-[.98] dark:border-indigo-800/60 dark:bg-indigo-950/20 dark:text-indigo-400 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/40 cursor-pointer"
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm font-semibold">Crear desafío de equipo</span>
          <span className="text-xs opacity-70">Motivá a tu equipo con un reto colectivo</span>
        </button>

        <CrearDesafioModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onCreated={() => { onRefresh?.(); }}
        />
      </>
    );
  }

  if (!data) return null;

  return (
    <>
      <div
        className={`rounded-2xl border p-5 backdrop-blur-sm transition-all hover:shadow-md ${
          data.completado
            ? "border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-800/50 dark:bg-emerald-950/40"
            : "border-indigo-200/80 bg-indigo-50/80 dark:border-indigo-800/50 dark:bg-indigo-950/40"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Target
              className={`h-5 w-5 shrink-0 ${
                data.completado
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-indigo-600 dark:text-indigo-400"
              }`}
            />
            <h3
              className={`truncate text-sm font-semibold ${
                data.completado
                  ? "text-emerald-800 dark:text-emerald-300"
                  : "text-indigo-800 dark:text-indigo-300"
              }`}
            >
              {data.titulo}
            </h3>
          </div>
          {data.turno && (
            <span className="ml-2 shrink-0 rounded-md bg-white/60 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-300">
              {data.turno}
            </span>
          )}
        </div>

        {"descripcion" in data && data.descripcion && (
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            {data.descripcion}
          </p>
        )}

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-600 dark:text-neutral-400">
              {fmtNumber(progreso)} / {fmtNumber(data.metaVentas)}
            </span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-200">
              {data.porcentaje}%
            </span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white/60 dark:bg-neutral-800/60">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                data.completado ? "bg-emerald-500" : "bg-indigo-500"
              }`}
              style={{ width: `${clampedPct}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400">
            {data.completado ? (
              <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5" />
                Completado
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {data.diasRestantes}{" "}
                {data.diasRestantes === 1 ? "día" : "días"} restantes
              </div>
            )}
          </div>

          {isSupervisor && esActivo && (
            <button
              type="button"
              onClick={handleCancelar}
              disabled={isPending}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-neutral-400 transition-all hover:bg-white/60 hover:text-red-500 active:scale-95 disabled:opacity-50 dark:hover:bg-neutral-800/60 dark:hover:text-red-400 cursor-pointer"
            >
              <XCircle className="h-3.5 w-3.5" />
              {isPending ? "Cancelando…" : "Cancelar"}
            </button>
          )}

          {isSupervisor && !esActivo && !data.completado && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-500 transition-all hover:bg-white/60 hover:text-indigo-700 active:scale-95 dark:text-indigo-400 dark:hover:bg-neutral-800/60 dark:hover:text-indigo-300 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Nuevo
            </button>
          )}
        </div>
      </div>

      {isSupervisor && (
        <CrearDesafioModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onCreated={() => { onRefresh?.(); }}
        />
      )}
    </>
  );
}
