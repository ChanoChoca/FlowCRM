"use client";

import {
  FlatResult,
  SearchResults as SearchResultsType,
  VentaResult,
  UsuarioResult,
} from "@/hooks/useGlobalSearch";
import { EstadoVenta } from "@/types/enums";
import { ShoppingCart, User } from "lucide-react";

const ESTADO_COLORS: Record<EstadoVenta, string> = {
  [EstadoVenta.PENDIENTE]: "text-amber-600 dark:text-amber-400",
  [EstadoVenta.PREVENTA]: "text-sky-600 dark:text-sky-400",
  [EstadoVenta.INICIADA]: "text-blue-600 dark:text-blue-400",
  [EstadoVenta.CUMPLIDA]: "text-emerald-600 dark:text-emerald-400",
  [EstadoVenta.TICKET]: "text-purple-600 dark:text-purple-400",
  [EstadoVenta.CANCELADA]: "text-red-600 dark:text-red-400",
  [EstadoVenta.RECHAZADA]: "text-neutral-500 dark:text-neutral-400",
};

interface Props {
  query: string;
  results: SearchResultsType;
  flatResults: FlatResult[];
  activeIndex: number;
  hasResults: boolean;
  loading: boolean;
  showUsuarios: boolean;
  onNavigate: (entry: FlatResult) => void;
  onHover: (index: number) => void;
}

export default function SearchResults({
  query,
  results,
  flatResults,
  activeIndex,
  hasResults,
  loading,
  showUsuarios,
  onNavigate,
  onHover,
}: Props) {
  if (!query.trim()) return null;

  return (
    <div className="max-h-80 overflow-y-auto py-2">
      {!hasResults && !loading && (
        <p className="px-4 py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
          Sin resultados para &ldquo;{query}&rdquo;
        </p>
      )}

      {showUsuarios && results.usuarios.length > 0 && (
        <section>
          <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Usuarios
          </p>
          {results.usuarios.map((u) => {
            const idx = flatResults.findIndex(
              (r) => r.type === "usuario" && r.item.id === u.id,
            );
            return (
              <SearchRow
                key={u.id}
                active={activeIndex === idx}
                onClick={() => onNavigate({ type: "usuario", item: u })}
                onMouseEnter={() => onHover(idx)}
                icon={<User className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />}
                primary={`${u.nombre} ${u.apellido}`}
                secondary={
                  <>
                    DNI {u.dni} ·{" "}
                    <span className={u.activo ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </>
                }
              />
            );
          })}
        </section>
      )}

      {results.ventas.length > 0 && (
        <section>
          <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Ventas
          </p>
          {results.ventas.map((v) => {
            const idx = flatResults.findIndex(
              (r) => r.type === "venta" && r.item.id === v.id,
            );
            return (
              <SearchRow
                key={v.id}
                active={activeIndex === idx}
                onClick={() => onNavigate({ type: "venta", item: v })}
                onMouseEnter={() => onHover(idx)}
                icon={<ShoppingCart className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />}
                primary={v.clienteNombre}
                secondary={`${v.producto} · ${v.central}`}
                badge={
                  <span className={`shrink-0 text-[11px] font-medium ${ESTADO_COLORS[v.estado] ?? ""}`}>
                    {v.estado}
                  </span>
                }
              />
            );
          })}
        </section>
      )}
    </div>
  );
}

function SearchRow({
  active,
  onClick,
  onMouseEnter,
  icon,
  primary,
  secondary,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  icon: React.ReactNode;
  primary: string;
  secondary: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer ${
        active
          ? "bg-neutral-100 dark:bg-neutral-800"
          : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
      }`}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
          {primary}
        </p>
        <p className="truncate text-[11px] text-neutral-400 dark:text-neutral-500">
          {secondary}
        </p>
      </div>
      {badge}
    </button>
  );
}
