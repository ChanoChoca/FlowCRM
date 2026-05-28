"use client";

import {
  cambiarEstadoTicket,
  crearTicket,
  responderTicket,
} from "@/app/actions/tickets";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { useToast } from "@/layout/ToastProvider";
import { Rol } from "@/types/enums";
import {
  CreateTicketRequest,
  EstadoTicket,
  TicketResponse,
} from "@/types/tickets";
import { Check, Clock, Mail, MessageSquare, Plus, Send, X } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

const ESTADO_COLOR: Record<EstadoTicket, string> = {
  [EstadoTicket.PENDIENTE]:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  [EstadoTicket.APROBADO]:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  [EstadoTicket.RECHAZADO]:
    "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

const ESTADO_LABEL: Record<EstadoTicket, string> = {
  [EstadoTicket.PENDIENTE]: "Pendiente",
  [EstadoTicket.APROBADO]: "Aprobado",
  [EstadoTicket.RECHAZADO]: "Rechazado",
};

function tiempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

function NuevoTicketForm({
  onCreado,
  onCancelar,
}: {
  onCreado: (t: TicketResponse) => void;
  onCancelar: () => void;
}) {
  const { show } = useToast();
  const [isPending, start] = useTransition();
  const [form, setForm] = useState<CreateTicketRequest>({
    titulo: "",
    descripcion: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.descripcion.trim()) return;
    start(async () => {
      try {
        const ticket = await crearTicket(form);
        show("Ticket enviado para aprobación", "success");
        onCreado(ticket);
      } catch {
        show("Error al crear el ticket", "error");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-neutral-700/80 dark:bg-neutral-900/80"
    >
      <h3 className="mb-4 text-sm font-semibold">Nuevo ticket</h3>
      <p className="mb-4 text-[12px] text-neutral-500 dark:text-neutral-400">
        El ticket quedará pendiente hasta que un líder o gerente lo apruebe o
        rechace.
      </p>
      <div className="flex flex-col gap-3">
        <input
          className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-neutral-500"
          placeholder="Título del ticket"
          value={form.titulo}
          onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
          maxLength={120}
          required
        />
        <textarea
          className="min-h-20 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-neutral-500"
          placeholder="Describe el problema o consulta..."
          value={form.descripcion}
          onChange={(e) =>
            setForm((f) => ({ ...f, descripcion: e.target.value }))
          }
          maxLength={1000}
          required
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-xl bg-neutral-900 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
          >
            {isPending ? "Enviando..." : "Crear ticket"}
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

function TicketDetalle({
  ticket,
  miId,
  esAprobador,
  onActualizado,
}: {
  ticket: TicketResponse;
  miId: number | undefined;
  esAprobador: boolean;
  onActualizado: (t: TicketResponse) => void;
}) {
  const { show } = useToast();
  const [respuesta, setRespuesta] = useState("");
  const [isPending, start] = useTransition();

  const finalizado =
    ticket.estado === EstadoTicket.APROBADO ||
    ticket.estado === EstadoTicket.RECHAZADO;

  const enviar = () => {
    if (!respuesta.trim()) return;
    start(async () => {
      try {
        const updated = await responderTicket(ticket.id, respuesta);
        setRespuesta("");
        onActualizado(updated);
      } catch {
        show("Error al enviar respuesta", "error");
      }
    });
  };

  const aprobar = () => {
    start(async () => {
      try {
        const updated = await cambiarEstadoTicket(
          ticket.id,
          EstadoTicket.APROBADO,
        );
        onActualizado(updated);
        show("Ticket aprobado y notificado al desarrollador", "success");
      } catch {
        show("Error al aprobar el ticket", "error");
      }
    });
  };

  const rechazar = () => {
    start(async () => {
      try {
        const updated = await cambiarEstadoTicket(
          ticket.id,
          EstadoTicket.RECHAZADO,
        );
        onActualizado(updated);
        show("Ticket rechazado", "success");
      } catch {
        show("Error al rechazar el ticket", "error");
      }
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{ticket.titulo}</h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            {ticket.creadorNombre} {ticket.creadorApellido}
            {ticket.asignadoNombre && (
              <>
                {" "}
                → {ticket.asignadoNombre} {ticket.asignadoApellido}
              </>
            )}
            <span className="ml-2 text-neutral-400">
              · {tiempoRelativo(ticket.creadoEn)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ESTADO_COLOR[ticket.estado]}`}
          >
            {ESTADO_LABEL[ticket.estado]}
          </span>
        </div>
      </div>

      <p className="rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300">
        {ticket.descripcion}
      </p>

      {ticket.mensajes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Conversación
          </p>
          {ticket.mensajes.map((m) => {
            const esMio = m.autorId === miId;
            return (
              <div
                key={m.id}
                className={`flex ${esMio ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    esMio
                      ? "rounded-tr-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "rounded-tl-sm bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
                  }`}
                >
                  <p className="mb-0.5 text-[10px] font-semibold opacity-60">
                    {m.autorNombre} {m.autorApellido}
                  </p>
                  <p>{m.contenido}</p>
                  <p className="mt-0.5 text-right text-[10px] opacity-50">
                    {tiempoRelativo(m.creadoEn)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {finalizado ? (
        <div
          className={`rounded-xl border px-3 py-2.5 text-[12px] ${
            ticket.estado === EstadoTicket.APROBADO
              ? "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
              : "border-red-200/80 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300"
          }`}
        >
          {ticket.estado === EstadoTicket.APROBADO
            ? "Ticket aprobado. Se notificó al desarrollador y la conversación quedó cerrada."
            : "Ticket rechazado. La conversación quedó cerrada."}
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:border-neutral-500"
              placeholder="Escribe una respuesta..."
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviar();
                }
              }}
              maxLength={2000}
              disabled={isPending}
            />
            <button
              type="button"
              onClick={enviar}
              disabled={isPending || !respuesta.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white transition hover:bg-neutral-700 disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {esAprobador && (
            <div className="flex gap-2 border-t border-neutral-200/80 pt-3 dark:border-neutral-700/80">
              <button
                type="button"
                onClick={aprobar}
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                Aprobar
              </button>
              <button
                type="button"
                onClick={rechazar}
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30 cursor-pointer"
              >
                <X className="h-4 w-4" />
                Rechazar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Soporte({
  tickets: inicial,
}: {
  tickets: TicketResponse[];
}) {
  const currentUser = useCurrentUser();
  const [tickets, setTickets] = useState(inicial);
  const [seleccionado, setSeleccionado] = useState<number | null>(
    inicial.length > 0 ? inicial[0].id : null,
  );
  const [mostrarForm, setMostrarForm] = useState(false);

  const ticketActivo = tickets.find((t) => t.id === seleccionado) ?? null;
  const esAprobador =
    currentUser?.rol === Rol.LIDER || currentUser?.rol === Rol.GERENTE;

  const actualizar = (t: TicketResponse) =>
    setTickets((prev) => prev.map((x) => (x.id === t.id ? t : x)));

  const onCreado = (t: TicketResponse) => {
    setTickets((prev) => [t, ...prev]);
    setSeleccionado(t.id);
    setMostrarForm(false);
  };

  return (
    <div className="flex min-w-0 flex-col gap-6 overflow-x-hidden">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-xl font-bold tracking-tight">
            Soporte
          </h1>
          <p className="break-words text-sm text-neutral-500 dark:text-neutral-400">
            {esAprobador
              ? "Revisá y aprobá o rechazá los tickets pendientes"
              : "Tus tickets serán revisados por un líder o gerente"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMostrarForm((v) => !v)}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 sm:w-auto cursor-pointer"
        >
          <Plus className="h-4 w-4 shrink-0" />
          Nuevo ticket
        </button>
      </div>

      {esAprobador && !currentUser?.email && (
        <div className="flex min-w-0 items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50 p-3 text-[12px] dark:border-amber-900/50 dark:bg-amber-950/30">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="break-words text-amber-900 dark:text-amber-200">
              Tu cuenta no tiene un correo asociado. Como líder/gerente, al
              aprobar un ticket sos quien emite la conversación al
              desarrollador, así que necesitás un email asociado para que el
              envío funcione correctamente.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/crm/usuarios"
                className="rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400"
              >
                Agregar email en mi perfil
              </Link>
              <a
                href={`${process.env.NEXT_PUBLIC_API ?? ""}/auth/google/link`}
                className="rounded-lg border border-amber-300 px-2.5 py-1 text-[11px] font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/40"
              >
                Vincular cuenta de Google
              </a>
            </div>
          </div>
        </div>
      )}

      {mostrarForm && (
        <NuevoTicketForm
          onCreado={onCreado}
          onCancelar={() => setMostrarForm(false)}
        />
      )}

      {tickets.length === 0 && !mostrarForm ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/60 py-16 dark:border-neutral-700/80 dark:bg-neutral-900/40">
          <MessageSquare className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
          <p className="text-sm text-neutral-400">
            No hay tickets aún. ¡Crea el primero!
          </p>
        </div>
      ) : (
        <div className="grid min-w-0 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-1.5">
            {tickets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSeleccionado(t.id)}
                className={`flex min-w-0 w-full flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition ${
                  seleccionado === t.id
                    ? "border-neutral-900 bg-neutral-900 text-white shadow-md dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-neutral-200/80 bg-white/70 hover:bg-neutral-50 dark:border-neutral-700/80 dark:bg-neutral-900/50 dark:hover:bg-neutral-800/60"
                } cursor-pointer`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                    {t.titulo}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      seleccionado === t.id
                        ? "bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900"
                        : ESTADO_COLOR[t.estado]
                    }`}
                  >
                    {ESTADO_LABEL[t.estado]}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] opacity-60">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {tiempoRelativo(t.actualizadoEn)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="min-w-0 rounded-2xl border border-neutral-200/80 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-neutral-700/80 dark:bg-neutral-900/80">
            {ticketActivo ? (
              <TicketDetalle
                key={ticketActivo.id}
                ticket={ticketActivo}
                miId={currentUser?.id}
                esAprobador={esAprobador}
                onActualizado={actualizar}
              />
            ) : (
              <div className="flex h-40 items-center justify-center text-sm text-neutral-400">
                Selecciona un ticket
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
