"use client";

import { useState, useTransition } from "react";
import { Megaphone, Plus, Eye, Trash2, CheckCircle2 } from "lucide-react";
import { AnuncioResponse, CreateAnuncioRequest } from "@/types/anuncios";
import {
  publicarAnuncio,
  marcarAnuncioLeido,
  eliminarAnuncio,
} from "@/app/actions/anuncios";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { useToast } from "@/layout/ToastProvider";
import { Rol } from "@/types/enums";

function tiempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

const ROL_LABELS: Record<Rol, string> = {
  [Rol.LIDER]: "Líder",
  [Rol.GERENTE]: "Gerente",
  [Rol.ADMINISTRACION_RRHH_COBRANZA]: "RRHH/Cobranza",
  [Rol.JEFE_DE_SUPERVISOR]: "Jefe de Supervisor",
  [Rol.SUPERVISOR]: "Supervisor",
  [Rol.ASESOR]: "Asesor",
};

// ── formulario nuevo anuncio ──────────────────────────────────────────────────

function NuevoAnuncioForm({
  onPublicado,
  onCancelar,
}: {
  onPublicado: (a: AnuncioResponse) => void;
  onCancelar: () => void;
}) {
  const { show } = useToast();
  const [isPending, start] = useTransition();
  const [form, setForm] = useState<CreateAnuncioRequest>({
    titulo: "",
    contenido: "",
    rolesDestino: [],
  });

  const toggleRol = (rol: Rol) =>
    setForm((f) => ({
      ...f,
      rolesDestino: f.rolesDestino.includes(rol)
        ? f.rolesDestino.filter((r) => r !== rol)
        : [...f.rolesDestino, rol],
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.contenido.trim()) return;
    start(async () => {
      try {
        const anuncio = await publicarAnuncio(form);
        show("Anuncio publicado", "success");
        onPublicado(anuncio);
      } catch {
        show("Error al publicar anuncio", "error");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-neutral-200/80 bg-white/80 p-4 sm:p-5 shadow-sm backdrop-blur dark:border-neutral-700/80 dark:bg-neutral-900/80"
    >
      <h3 className="mb-4 text-sm font-semibold">Nuevo comunicado</h3>
      <div className="flex flex-col gap-3">
        <input
          className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-neutral-500"
          placeholder="Título del comunicado"
          value={form.titulo}
          onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
          maxLength={150}
          required
        />
        <textarea
          className="min-h-[100px] rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-neutral-500"
          placeholder="Contenido del comunicado..."
          value={form.contenido}
          onChange={(e) => setForm((f) => ({ ...f, contenido: e.target.value }))}
          maxLength={3000}
          required
        />
        {/* Roles destino */}
        <div>
          <p className="mb-1.5 text-[11px] font-semibold text-neutral-500">
            Dirigido a (vacío = todos los roles)
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.values(Rol).filter((v) => typeof v === "number") as Rol[]).map((rol) => (
              <button
                key={rol}
                type="button"
                onClick={() => toggleRol(rol)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition cursor-pointer ${
                  form.rolesDestino.includes(rol)
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "border border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                }`}
              >
                {ROL_LABELS[rol]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-xl bg-neutral-900 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
          >
            {isPending ? "Publicando..." : "Publicar"}
          </button>
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  );
}

// ── tarjeta de anuncio ───────────────────────────────────────────────────────

function AnuncioCard({
  anuncio,
  puedeEliminar,
  onLeido,
  onEliminado,
}: {
  anuncio: AnuncioResponse;
  puedeEliminar: boolean;
  onLeido: (a: AnuncioResponse) => void;
  onEliminado: (id: number) => void;
}) {
  const { show } = useToast();
  const [isPending, start] = useTransition();
  const [expandido, setExpandido] = useState(false);

  const leer = () => {
    start(async () => {
      try {
        const updated = await marcarAnuncioLeido(anuncio.id);
        onLeido(updated);
      } catch {
        show("Error al marcar como leído", "error");
      }
    });
  };

  const eliminar = () => {
    start(async () => {
      try {
        await eliminarAnuncio(anuncio.id);
        onEliminado(anuncio.id);
        show("Anuncio eliminado", "success");
      } catch {
        show("Error al eliminar", "error");
      }
    });
  };

  return (
    <article
      className={`rounded-2xl border bg-white/80 p-4 sm:p-5 shadow-sm backdrop-blur transition dark:bg-neutral-900/80 ${
        anuncio.leidoPorMi
          ? "border-neutral-200/80 dark:border-neutral-700/80 opacity-80"
          : "border-blue-200/80 dark:border-blue-800/50"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
            <Megaphone className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold leading-tight wrap-break-word">{anuncio.titulo}</h3>
              {!anuncio.leidoPorMi && (
                <span className="shrink-0 rounded-full bg-blue-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                  NUEVO
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] text-neutral-400 wrap-break-word">
              {anuncio.autorNombre} {anuncio.autorApellido} · {tiempoRelativo(anuncio.creadoEn)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-start">
          {anuncio.leidoPorMi ? (
            <span className="flex items-center gap-1 text-[11px] text-emerald-500">
              <CheckCircle2 className="h-3.5 w-3.5" /> Leído
            </span>
          ) : (
            <button
              type="button"
              onClick={leer}
              disabled={isPending}
              className="flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-[11px] font-semibold text-neutral-600 transition hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
            >
              <Eye className="h-3 w-3" /> Marcar leído
            </button>
          )}
          {puedeEliminar && (
            <button
              type="button"
              onClick={eliminar}
              disabled={isPending}
              className="rounded-lg p-1 text-red-400 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950/30 cursor-pointer"
              title="Eliminar anuncio"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="mt-3">
        <p
          className={`text-sm text-neutral-700 dark:text-neutral-300 wrap-break-word ${
            expandido ? "whitespace-pre-wrap" : "line-clamp-3"
          }`}
        >
          {anuncio.contenido}
        </p>
        {anuncio.contenido.length > 200 && (
          <button
            type="button"
            onClick={() => setExpandido((v) => !v)}
            className="mt-1 text-[11px] font-semibold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            {expandido ? "Ver menos" : "Ver más"}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {anuncio.rolesDestino.length > 0 ? (
          anuncio.rolesDestino.map((r) => (
            <span
              key={r}
              className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
            >
              {ROL_LABELS[r]}
            </span>
          ))
        ) : (
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            Todos los roles
          </span>
        )}
        <span className="ml-auto text-[11px] text-neutral-400">
          {anuncio.totalLecturas} lectura{anuncio.totalLecturas !== 1 ? "s" : ""}
        </span>
      </div>
    </article>
  );
}

// ── componente principal ─────────────────────────────────────────────────────

export default function Anuncios({ anuncios: inicial }: { anuncios: AnuncioResponse[] }) {
  const currentUser = useCurrentUser();
  const [anuncios, setAnuncios] = useState(inicial);
  const [mostrarForm, setMostrarForm] = useState(false);

  const puedePublicar =
    currentUser?.rol !== undefined && currentUser.rol >= Rol.SUPERVISOR;

  const onPublicado = (a: AnuncioResponse) => {
    setAnuncios((prev) => [a, ...prev]);
    setMostrarForm(false);
  };

  const onLeido = (a: AnuncioResponse) =>
    setAnuncios((prev) => prev.map((x) => (x.id === a.id ? a : x)));

  const onEliminado = (id: number) =>
    setAnuncios((prev) => prev.filter((a) => a.id !== id));

  const sinLeer = anuncios.filter((a) => !a.leidoPorMi).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Título */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Comunicados</h1>
            {sinLeer > 0 && (
              <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white">
                {sinLeer} sin leer
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Anuncios y comunicados del equipo
          </p>
        </div>
        {puedePublicar && (
          <button
            type="button"
            onClick={() => setMostrarForm((v) => !v)}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nuevo comunicado
          </button>
        )}
      </div>

      {mostrarForm && (
        <NuevoAnuncioForm onPublicado={onPublicado} onCancelar={() => setMostrarForm(false)} />
      )}

      {anuncios.length === 0 && !mostrarForm ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/60 py-16 dark:border-neutral-700/80 dark:bg-neutral-900/40">
          <Megaphone className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
          <p className="text-sm text-neutral-400">No hay comunicados todavía.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {anuncios.map((a) => (
            <AnuncioCard
              key={a.id}
              anuncio={a}
              puedeEliminar={
                puedePublicar &&
                (a.autorId === undefined || (currentUser?.rol ?? 0) >= Rol.JEFE_DE_SUPERVISOR)
              }
              onLeido={onLeido}
              onEliminado={onEliminado}
            />
          ))}
        </div>
      )}
    </div>
  );
}
