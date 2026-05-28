"use client";

import { VentaFilters } from "@/app/actions/ventas";
import { SavedView } from "@/hooks/useVentaViews";
import { useRef, useState } from "react";

export default function VentaSavedViews({
  views,
  currentFilters,
  hasFilters,
  onLoad,
  onSave,
  onDelete,
}: {
  views: SavedView[];
  currentFilters: VentaFilters;
  hasFilters: boolean;
  onLoad: (filters: VentaFilters) => void;
  onSave: (name: string, filters: VentaFilters) => void;
  onDelete: (id: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, currentFilters);
    setName("");
    setSaving(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") {
      setSaving(false);
      setName("");
    }
  }

  const hasViews = views.length > 0;

  if (!hasViews && !hasFilters) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
          Preferencias guardadas
        </span>
        {!hasViews && !saving && (
          <span className="text-xs text-neutral-400 dark:text-neutral-600">
            — aplicá filtros y guardá una preferencia para acceder rápido
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {views.map((view) => (
          <div
            key={view.id}
            className="group flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-700/50 dark:bg-indigo-950/40 dark:text-indigo-300"
          >
            <button
              type="button"
              className="cursor-pointer hover:underline"
              onClick={() => onLoad(view.filters)}
              title={`Aplicar preferencia: ${view.name}`}
            >
              {view.name}
            </button>
            <button
              type="button"
              onClick={() => onDelete(view.id)}
              className="ml-0.5 cursor-pointer rounded-full p-0.5 text-indigo-400 opacity-0 transition-opacity hover:text-indigo-700 group-hover:opacity-100 dark:text-indigo-500 dark:hover:text-indigo-300"
              title="Eliminar preferencia"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3 w-3"
              >
                <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
              </svg>
            </button>
          </div>
        ))}

        {saving ? (
          <div className="flex items-center gap-1.5">
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej: Mis ventas de este mes…"
              maxLength={40}
              className="rounded-lg border border-indigo-300 bg-white px-2.5 py-1 text-xs text-neutral-900 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-indigo-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim()}
              className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => {
                setSaving(false);
                setName("");
              }}
              className="rounded-lg border border-neutral-200 px-2.5 py-1 text-xs text-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        ) : (
          hasFilters && (
            <button
              type="button"
              onClick={() => setSaving(true)}
              className="flex items-center gap-1 rounded-full border border-dashed border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3 w-3"
              >
                <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
              </svg>
              Guardar preferencia
            </button>
          )
        )}
      </div>
    </div>
  );
}
