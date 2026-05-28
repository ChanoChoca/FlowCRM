"use client";

import {
  crearDesafioAction,
  type DesafioActionState,
} from "@/app/actions/desafios";
import Field from "@/components/Field";
import Modal from "@/components/Modal";
import { AuditoriaHorario } from "@/types/enums";
import { useActionState, useEffect, useRef } from "react";

const TURNO_OPTIONS = [
  { value: AuditoriaHorario.AM, label: "Mañana (AM)" },
  { value: AuditoriaHorario.PM, label: "Tarde (PM)" },
];

export default function CrearDesafioModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [state, action, isPending] = useActionState<DesafioActionState, FormData>(
    crearDesafioAction,
    null,
  );

  // Distingue montaje inicial del estado null post-submit exitoso
  const submitted = useRef(false);
  if (isPending) submitted.current = true;

  useEffect(() => {
    if (submitted.current && !isPending && state === null) {
      submitted.current = false;
      onCreated();
      onClose();
    }
  }, [isPending, state, onCreated, onClose]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal open={open} title="Crear desafío de equipo" onClose={onClose}>
      <form action={action} className="flex flex-col gap-4">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Lanzá un reto colectivo para tu equipo. Cuando se alcanza la meta,
          queda registrado como un logro grupal.
        </p>

        <Field label="Título" name="titulo" required placeholder="Ej: Sprint de mayo" />

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Descripción (opcional)
          </label>
          <textarea
            name="descripcion"
            rows={2}
            placeholder="Detalle o motivación del desafío…"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-200 dark:placeholder:text-neutral-500 dark:focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Meta de ventas"
            name="metaVentas"
            type="number"
            min={1}
            required
            placeholder="Ej: 50"
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Turno
            </label>
            <select
              name="turno"
              required
              defaultValue=""
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-200 dark:focus:border-indigo-500"
            >
              <option value="" disabled>
                Seleccionar…
              </option>
              {TURNO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Fecha de inicio"
            name="fechaInicio"
            type="date"
            required
            defaultValue={today}
            min={today}
          />
          <Field
            label="Fecha de vencimiento"
            name="fechaVencimiento"
            type="date"
            required
            min={today}
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {state.error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-50 active:scale-95 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {isPending ? "Creando…" : "Crear desafío"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
