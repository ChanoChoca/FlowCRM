"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { NotificacionResponse, TipoNotificacion } from "@/types/notificaciones";
import { Bell, CheckCheck, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const TIPO_ICON: Record<TipoNotificacion, string> = {
  [TipoNotificacion.VENTA_ASIGNADA]: "💼",
  [TipoNotificacion.TICKET_RESPONDIDO]: "💬",
  [TipoNotificacion.TICKET_CREADO]: "🎫",
  [TipoNotificacion.META_ALCANZADA]: "🏆",
  [TipoNotificacion.ANUNCIO]: "📢",
  [TipoNotificacion.ESCALAMIENTO]: "⚠️",
};

function getDestino(n: NotificacionResponse): string | null {
  switch (n.tipo) {
    case TipoNotificacion.TICKET_CREADO:
    case TipoNotificacion.TICKET_RESPONDIDO:
      return "/crm/soporte";
    case TipoNotificacion.VENTA_ASIGNADA:
      return "/crm/ventas";
    case TipoNotificacion.ANUNCIO:
      return "/crm/anuncios";
    default:
      return null;
  }
}

function tiempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

function ItemNotificacion({
  n,
  onLeer,
  onEliminar,
  onNavegar,
}: {
  n: NotificacionResponse;
  onLeer: (id: number) => void;
  onEliminar: (id: number) => void;
  onNavegar: (destino: string, id: number) => void;
}) {
  const destino = getDestino(n);

  function handleClick() {
    if (!destino) return;
    onNavegar(destino, n.id);
  }

  return (
    <div
      onClick={destino ? handleClick : undefined}
      className={`group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
        n.leida ? "opacity-60" : "bg-blue-50/60 dark:bg-blue-950/20"
      } hover:bg-neutral-100 dark:hover:bg-neutral-800/60 ${
        destino ? "cursor-pointer" : ""
      }`}
    >
      <span className="mt-0.5 text-lg leading-none">{TIPO_ICON[n.tipo]}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold text-neutral-800 dark:text-neutral-100">
          {n.titulo}
        </p>
        <p className="line-clamp-2 text-[11px] text-neutral-500 dark:text-neutral-400">
          {n.mensaje}
        </p>
        <p className="mt-0.5 text-[10px] text-neutral-400 dark:text-neutral-500">
          {tiempoRelativo(n.creadoEn)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!n.leida && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onLeer(n.id); }}
            className="rounded-lg p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer"
            title="Marcar como leída"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEliminar(n.id); }}
          className="rounded-lg p-1 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 cursor-pointer"
          title="Eliminar"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function NotificationBell() {
  const {
    notificaciones,
    noLeidas,
    cargando,
    marcarLeida,
    marcarTodasLeidas,
    eliminar,
  } = useNotifications();
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function handleNavegar(destino: string, id: number) {
    if (!notificaciones.find((n) => n.id === id)?.leida) {
      marcarLeida(id);
    }
    setAbierto(false);
    router.push(destino);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200/80 bg-white/60 shadow-sm backdrop-blur transition-all hover:scale-105 hover:shadow-md active:scale-95 dark:border-neutral-700/80 dark:bg-neutral-800/60 cursor-pointer"
        aria-label="Notificaciones"
      >
        <Bell className="h-4 w-4 transition-transform group-hover:rotate-12" />
        {noLeidas > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="fixed right-2 left-2 top-16 z-1000 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-neutral-700/80 dark:bg-neutral-900/95 animate-fade-in sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-80">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200/70 px-4 py-3 dark:border-neutral-800/70">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-neutral-500" />
              <span className="text-[13px] font-semibold">Notificaciones</span>
              {noLeidas > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {noLeidas}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {noLeidas > 0 && (
                <button
                  type="button"
                  onClick={marcarTodasLeidas}
                  className="rounded-lg px-2 py-1 text-[11px] font-medium text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer"
                >
                  Marcar todas
                </button>
              )}
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-96 overflow-y-auto px-2 py-2">
            {cargando ? (
              <p className="py-8 text-center text-[12px] text-neutral-400">
                Cargando...
              </p>
            ) : notificaciones.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10">
                <Bell className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                <p className="text-[12px] text-neutral-400">
                  Sin notificaciones
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {notificaciones.map((n) => (
                  <ItemNotificacion
                    key={n.id}
                    n={n}
                    onLeer={marcarLeida}
                    onEliminar={eliminar}
                    onNavegar={handleNavegar}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
