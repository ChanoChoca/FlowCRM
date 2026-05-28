"use client";

import { cambiarEstadoVenta } from "@/app/actions/ventas";
import EstadoBadge from "@/components/EstadoBadge";
import { useToast } from "@/layout/ToastProvider";
import { VentaResponse } from "@/types/dtos";
import { EstadoVenta } from "@/types/enums";
import { useState, useTransition } from "react";

const COLUMNAS: { estado: EstadoVenta; label: string; icon: string }[] = [
  { estado: EstadoVenta.PENDIENTE, label: "Pendiente", icon: "⏳" },
  { estado: EstadoVenta.PREVENTA, label: "Preventa", icon: "🔄" },
  { estado: EstadoVenta.INICIADA, label: "Iniciada", icon: "🔵" },
  { estado: EstadoVenta.CUMPLIDA, label: "Cumplida", icon: "✅" },
  { estado: EstadoVenta.TICKET, label: "Ticket", icon: "🎫" },
  { estado: EstadoVenta.CANCELADA, label: "Cancelada", icon: "🚫" },
  { estado: EstadoVenta.RECHAZADA, label: "Rechazada", icon: "❌" },
];

const TRANSICIONES: Partial<Record<EstadoVenta, EstadoVenta[]>> = {
  [EstadoVenta.PENDIENTE]: [EstadoVenta.PREVENTA, EstadoVenta.CANCELADA],
  [EstadoVenta.PREVENTA]: [
    EstadoVenta.INICIADA,
    EstadoVenta.CANCELADA,
    EstadoVenta.RECHAZADA,
  ],
  [EstadoVenta.INICIADA]: [
    EstadoVenta.CUMPLIDA,
    EstadoVenta.TICKET,
    EstadoVenta.CANCELADA,
  ],
  [EstadoVenta.CUMPLIDA]: [EstadoVenta.RECHAZADA],
  [EstadoVenta.TICKET]: [EstadoVenta.CUMPLIDA, EstadoVenta.RECHAZADA],
};

const COLUMNA_STYLES: Record<EstadoVenta, string> = {
  [EstadoVenta.PENDIENTE]: "border-t-amber-400",
  [EstadoVenta.PREVENTA]: "border-t-sky-400",
  [EstadoVenta.INICIADA]: "border-t-blue-500",
  [EstadoVenta.CUMPLIDA]: "border-t-emerald-500",
  [EstadoVenta.TICKET]: "border-t-purple-500",
  [EstadoVenta.CANCELADA]: "border-t-red-500",
  [EstadoVenta.RECHAZADA]: "border-t-neutral-400",
};

function VentaCard({
  venta,
  onVerDetalle,
  onMove,
  moving,
}: {
  venta: VentaResponse;
  onVerDetalle: (id: number) => void;
  onMove: (id: number, estado: EstadoVenta) => void;
  moving: boolean;
}) {
  const destinos = TRANSICIONES[venta.estado] ?? [];

  return (
    <div
      className={`rounded-xl border border-neutral-200/80 bg-white p-3 shadow-sm transition-opacity dark:border-neutral-700/50 dark:bg-neutral-900 ${moving ? "opacity-50" : ""}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
          #{venta.id}
        </span>
        <EstadoBadge estado={venta.estado} />
      </div>

      <p className="mb-0.5 text-sm font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
        {venta.clienteNombre}
      </p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
        {venta.promo}
      </p>
      <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
        {venta.asesorNombre} {venta.asesorApellido}
        {venta.supervisorNombre ? ` · ${venta.supervisorNombre} ${venta.supervisorApellido}` : ""}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onVerDetalle(venta.id!)}
          className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
        >
          Ver
        </button>
        {destinos.map((dest) => {
          const col = COLUMNAS.find((c) => c.estado === dest)!;
          return (
            <button
              key={dest}
              type="button"
              disabled={moving}
              onClick={() => onMove(venta.id!, dest)}
              className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              → {col.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function VentaPipeline({
  ventas,
  onVerDetalle,
}: {
  ventas: VentaResponse[];
  onVerDetalle: (id: number) => void;
}) {
  const { show } = useToast();
  const [isPending, startTransition] = useTransition();
  const [movingId, setMovingId] = useState<number | null>(null);

  function handleMove(id: number, estado: EstadoVenta) {
    setMovingId(id);
    startTransition(async () => {
      const result = await cambiarEstadoVenta(id, estado);
      setMovingId(null);
      if (result?.error) {
        show(result.error, "error");
      } else {
        show(`Estado actualizado a ${estado}`, "success");
      }
    });
  }

  const byEstado = Object.fromEntries(
    COLUMNAS.map(({ estado }) => [
      estado,
      ventas.filter((v) => v.estado === estado),
    ]),
  ) as Record<EstadoVenta, VentaResponse[]>;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {COLUMNAS.map(({ estado, label, icon }) => {
          const cards = byEstado[estado] ?? [];
          return (
            <div
              key={estado}
              className={`flex w-64 flex-col rounded-2xl border border-neutral-200/80 bg-neutral-50/80 dark:border-neutral-700/50 dark:bg-neutral-900/60 border-t-4 ${COLUMNA_STYLES[estado]}`}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                  {icon} {label}
                </span>
                <span className="rounded-full bg-neutral-200/80 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                  {cards.length}
                </span>
              </div>

              <div
                className="flex flex-col gap-3 overflow-y-auto px-3 pb-4"
                style={{ maxHeight: "70vh" }}
              >
                {cards.length === 0 ? (
                  <p className="py-6 text-center text-xs text-neutral-400 dark:text-neutral-600">
                    Sin ventas
                  </p>
                ) : (
                  cards.map((v) => (
                    <VentaCard
                      key={v.id}
                      venta={v}
                      onVerDetalle={onVerDetalle}
                      onMove={handleMove}
                      moving={movingId === v.id && isPending}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
