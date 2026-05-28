"use client";

import type { Segmento } from "@/types/dashboard";
import { ArrowDown, ArrowUp, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { fmtNumber } from "../utils";

type SortKey = "cantidad" | "nombre";
type SortDir = "asc" | "desc";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  data: Segmento[];
};

export default function SegmentDrawer({ open, onClose, title, data }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("cantidad");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSortKey("cantidad");
      setSortDir("desc");
    }
  }, [open]);

  const total = useMemo(() => data.reduce((s, d) => s + d.cantidad, 0), [data]);
  const max = useMemo(
    () => data.reduce((m, d) => (d.cantidad > m ? d.cantidad : m), 0),
    [data],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? data.filter((d) => d.nombre.toLowerCase().includes(q))
      : data;
    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === "nombre") {
        return sortDir === "asc"
          ? a.nombre.localeCompare(b.nombre, "es")
          : b.nombre.localeCompare(a.nombre, "es");
      }
      return sortDir === "asc"
        ? a.cantidad - b.cantidad
        : b.cantidad - a.cantidad;
    });
    return sorted;
  }, [data, query, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "nombre" ? "asc" : "desc");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-md bg-transparent p-0 backdrop:bg-neutral-900/40 backdrop:backdrop-blur-sm"
    >
      <div
        className="flex h-full flex-col border-l border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <div>
            <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
              {title}
            </h2>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {fmtNumber(data.length)}{" "}
              {data.length === 1 ? "registro" : "registros"} ·{" "}
              {fmtNumber(total)} ventas
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pr-3 pl-9 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:bg-neutral-900 dark:focus:ring-indigo-950"
            />
          </div>
        </div>

        <div className="sticky top-0 grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-neutral-200 bg-neutral-50/80 px-5 py-2 text-xs font-medium text-neutral-500 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400">
          <SortButton
            label="Nombre"
            active={sortKey === "nombre"}
            dir={sortDir}
            onClick={() => toggleSort("nombre")}
          />
          <SortButton
            label="Ventas"
            active={sortKey === "cantidad"}
            dir={sortDir}
            onClick={() => toggleSort("cantidad")}
            align="right"
          />
          <span className="w-24 text-right">%</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {rows.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-neutral-500 dark:text-neutral-400">
              Sin resultados para "{query}"
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-900">
              {rows.map((seg) => {
                const pct = total > 0 ? (seg.cantidad / total) * 100 : 0;
                const barW = max > 0 ? (seg.cantidad / max) * 100 : 0;
                return (
                  <li
                    key={seg.nombre}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-5 py-2.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                  >
                    <span className="truncate text-neutral-700 dark:text-neutral-200">
                      {seg.nombre}
                    </span>
                    <span className="text-right font-medium tabular-nums text-neutral-800 dark:text-neutral-100">
                      {fmtNumber(seg.cantidad)}
                    </span>
                    <div className="flex w-24 items-center justify-end gap-2">
                      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${barW}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </dialog>
  );
}

function SortButton({
  label,
  active,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  align?: "left" | "right";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 transition-colors hover:text-neutral-800 dark:hover:text-neutral-100 ${
        align === "right" ? "justify-end" : "justify-start"
      } ${active ? "text-neutral-800 dark:text-neutral-100" : ""}`}
    >
      {label}
      {active &&
        (dir === "asc" ? (
          <ArrowUp className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3" />
        ))}
    </button>
  );
}
