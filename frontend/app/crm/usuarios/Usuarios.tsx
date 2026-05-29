"use client";

import {
  activarUsuario,
  desactivarUsuario,
  obtenerDetalleUsuario,
  UsuarioActionState,
  UsuarioFilters,
} from "@/app/actions/usuarios";
import Pagination from "@/components/Pagination";
import UsuarioFiltersPanel from "@/components/UsuarioFilters";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { useUsuarioFilters } from "@/hooks/useUsuarioFilters";
import { useToast } from "@/layout/ToastProvider";
import { fmtDate } from "@/lib/mappers/date";
import { rolLabel } from "@/lib/mappers/rol";
import {
  puedeCambiarPassword,
  puedeCrearUsuario,
  puedeDesactivarUsuario,
  puedeEditarUsuario,
} from "@/lib/usuarios/permisos";
import {
  PageResponse,
  UsuarioAuthResponse,
  UsuarioDetalleResponse,
  UsuarioResponse,
  UsuarioSupervisorResponse,
} from "@/types/dtos";
import { Rol } from "@/types/enums";
import { Provincia } from "@/types/models";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import UsuarioForm from "./UsuarioForm";

type PanelState =
  | { mode: "closed" }
  | { mode: "view"; id: number; detail: UsuarioDetalleResponse | null; loading: boolean }
  | { mode: "edit"; id: number; detail: UsuarioDetalleResponse | null; loading: boolean }
  | { mode: "create" };

export default function Usuarios({
  usuariosPage,
  currentPage,
  currentSize,
  filters,
  supervisores,
  jefesDeSupervisor,
  provincias,
  scopedCurrentUser,
}: {
  usuariosPage: PageResponse<UsuarioResponse>;
  currentPage: number;
  currentSize: number;
  filters: UsuarioFilters;
  supervisores: UsuarioSupervisorResponse[];
  jefesDeSupervisor: UsuarioSupervisorResponse[];
  provincias: Provincia[];
  scopedCurrentUser?: UsuarioAuthResponse | null;
}) {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const puedeCrear = useMemo(() => puedeCrearUsuario(currentUser), [currentUser]);

  const [panel, setPanel] = useState<PanelState>({ mode: "closed" });

  const { applyFilters, applyFilterDebounced, clearFilters, hasFilters, filterExtraParams } =
    useUsuarioFilters(filters, currentSize);

  const openPanel = useCallback(async (id: number, mode: "view" | "edit") => {
    setPanel({ mode, id, detail: null, loading: true });
    const detail = await obtenerDetalleUsuario(String(id));
    setPanel({ mode, id, detail, loading: false });
  }, []);

  const closePanel = useCallback(() => setPanel({ mode: "closed" }), []);

  // Handle ?nuevo=true URL param
  const searchParams = useSearchParams();
  const triggeredRef = useRef(false);
  useEffect(() => {
    if (triggeredRef.current) return;
    if (searchParams.get("nuevo") !== "true") return;
    triggeredRef.current = true;
    if (puedeCrear) setPanel({ mode: "create" });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("nuevo");
    const qs = params.toString();
    router.replace(qs ? `/crm/usuarios?${qs}` : "/crm/usuarios", { scroll: false });
  }, [searchParams, router, puedeCrear]);

  const effectiveRows = useMemo<UsuarioResponse[]>(() => {
    const rol = scopedCurrentUser?.rol;
    if (
      scopedCurrentUser != null &&
      (rol === Rol.SUPERVISOR || rol === Rol.JEFE_DE_SUPERVISOR) &&
      currentPage === 0
    ) {
      const alreadyPresent = usuariosPage.content.some(
        (u) => u.id === scopedCurrentUser.id,
      );
      if (!alreadyPresent) {
        const selfRow: UsuarioResponse = {
          id: scopedCurrentUser.id,
          dni: scopedCurrentUser.dni,
          nombre: scopedCurrentUser.nombre,
          apellido: scopedCurrentUser.apellido,
          telefono: scopedCurrentUser.telefono,
          rol: scopedCurrentUser.rol,
          supervisor: scopedCurrentUser.supervisor,
          activo: scopedCurrentUser.activo ?? true,
          rankingOptActivo: scopedCurrentUser.rankingOptActivo ?? false,
          ultimoLogin: scopedCurrentUser.ultimoLogin ?? null,
          creadoEn: scopedCurrentUser.creadoEn ?? "",
        };
        return [selfRow, ...usuariosPage.content];
      }
    }
    return usuariosPage.content;
  }, [scopedCurrentUser, usuariosPage.content, currentPage]);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight dark:text-neutral-100">
            Usuarios
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Gestión paginada de usuarios, con acciones por rol.
          </p>
        </div>
        {puedeCrear && (
          <button
            type="button"
            onClick={() => setPanel({ mode: "create" })}
            className="rounded-xl bg-linear-to-br from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] cursor-pointer"
          >
            Crear usuario
          </button>
        )}
      </div>

      <UsuarioFiltersPanel
        filters={filters}
        supervisores={supervisores}
        hasFilters={hasFilters}
        onDebounced={applyFilterDebounced}
        onImmediate={applyFilters}
        onClear={clearFilters}
      />

      <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/80 shadow-sm backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700/50">
            <thead className="bg-neutral-50/80 dark:bg-neutral-800/50">
              <tr>
                {["ID", "Usuario", "Rol", "Supervisor", "Activo", "Creado", "Acciones"].map(
                  (h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 ${h === "Acciones" ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
              {effectiveRows.map((u) => {
                const canEdit = puedeEditarUsuario(currentUser, u);
                const canDelete = puedeDesactivarUsuario(currentUser, u);
                return (
                  <tr
                    key={u.id}
                    className="text-sm transition-colors duration-150 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30"
                  >
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                      {u.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {u.apellido}, {u.nombre}
                      </div>
                      <div className="text-neutral-500 dark:text-neutral-400">{u.dni}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                      {rolLabel(u.rol)}
                    </td>
                    <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                      {u.supervisor?.id ? (
                        <span>{u.supervisor.apellido}, {u.supervisor.nombre}</span>
                      ) : (
                        <span className="text-neutral-400 dark:text-neutral-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          u.activo
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                        }`}
                      >
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                      {fmtDate(u.creadoEn ?? undefined)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openPanel(u.id!, "view")}
                          className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 active:scale-95 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
                        >
                          Ver
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => openPanel(u.id!, "edit")}
                            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 active:scale-95 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
                          >
                            Editar
                          </button>
                        )}
                        {canDelete && <ToggleActivoButton id={u.id!} activo={u.activo} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {effectiveRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-neutral-400 dark:text-neutral-500">
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-neutral-100 p-4 dark:border-neutral-800/50">
          <Pagination
            currentPage={currentPage}
            currentSize={currentSize}
            totalPages={usuariosPage.totalPages}
            extraParams={filterExtraParams}
          />
        </div>
      </div>

      {panel.mode !== "closed" && (
        <>
          <div
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/30 backdrop-blur-sm"
            onClick={closePanel}
          />
          <div className="fixed bottom-0 right-0 top-16 z-50 flex w-full max-w-2xl flex-col overflow-y-auto border-l border-neutral-200/80 bg-white shadow-2xl dark:border-neutral-700/50 dark:bg-neutral-950">
            {(panel.mode === "view" || panel.mode === "edit") && panel.loading && (
              <div className="flex flex-1 items-center justify-center p-12">
                <button
                  type="button"
                  onClick={closePanel}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">Cargando...</div>
              </div>
            )}

            {panel.mode === "view" && !panel.loading && panel.detail && (
              <DetailView
                detail={panel.detail}
                id={panel.id}
                currentUser={currentUser}
                supervisores={supervisores}
                jefesDeSupervisor={jefesDeSupervisor}
                onEdit={() =>
                  setPanel({ mode: "edit", id: panel.id, detail: panel.detail, loading: false })
                }
                onClose={closePanel}
              />
            )}

            {panel.mode === "edit" && !panel.loading && panel.detail && (
              <UsuarioForm
                mode="edit"
                id={String(panel.id)}
                usuario={panel.detail}
                currentUserRol={currentUser?.rol}
                canChangePassword={puedeCambiarPassword(currentUser, {
                  id: panel.id,
                  dni: panel.detail.dni,
                  nombre: panel.detail.nombre,
                  apellido: panel.detail.apellido,
                  rol: panel.detail.rol,
                  activo: true,
                  rankingOptActivo: true,
                  creadoEn: panel.detail.creadoEn ?? "",
                } as UsuarioResponse)}
                supervisores={supervisores}
                jefesDeSupervisor={jefesDeSupervisor}
                provincias={provincias}
                returnPage={currentPage}
                returnSize={currentSize}
                onCancel={closePanel}
              />
            )}

            {panel.mode === "create" && (
              <UsuarioForm
                mode="create"
                currentUserRol={currentUser?.rol}
                supervisores={supervisores}
                jefesDeSupervisor={jefesDeSupervisor}
                provincias={provincias}
                returnPage={currentPage}
                returnSize={currentSize}
                onCancel={closePanel}
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}

function ToggleActivoButton({ id, activo }: { id: number; activo: boolean }) {
  const { show } = useToast();
  const action = activo ? desactivarUsuario : activarUsuario;
  const [state, formAction, isPending] = useActionState<UsuarioActionState, FormData>(action, null);
  const intentRef = useRef<"activar" | "desactivar" | null>(null);

  useEffect(() => {
    if (state === null || intentRef.current === null) return;
    const intent = intentRef.current;
    intentRef.current = null;
    if (state.error) {
      show(state.error, "error");
    } else {
      show(
        intent === "desactivar"
          ? "Usuario desactivado correctamente"
          : "Usuario activado correctamente",
        "success",
      );
    }
  }, [state, show]);

  return (
    <form action={formAction} onSubmit={() => { intentRef.current = activo ? "desactivar" : "activar"; }}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={isPending}
        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer ${
          activo
            ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-950/30"
            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800/50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
        }`}
      >
        {isPending ? "..." : activo ? "Desactivar" : "Activar"}
      </button>
    </form>
  );
}

function DetailView({
  detail,
  id,
  currentUser,
  supervisores,
  jefesDeSupervisor,
  onEdit,
  onClose,
}: {
  detail: UsuarioDetalleResponse;
  id: number;
  currentUser: ReturnType<typeof useCurrentUser>;
  supervisores: UsuarioSupervisorResponse[];
  jefesDeSupervisor: UsuarioSupervisorResponse[];
  onEdit: () => void;
  onClose: () => void;
}) {
  const supervisor =
    detail.rol === Rol.SUPERVISOR
      ? jefesDeSupervisor.find((s) => s.id === detail.supervisorId)
      : supervisores.find((s) => s.id === detail.supervisorId);

  const canEdit = puedeEditarUsuario(currentUser, {
    id,
    dni: detail.dni,
    nombre: detail.nombre,
    apellido: detail.apellido,
    telefono: detail.telefono,
    rol: detail.rol,
    supervisor,
    ultimoLogin: detail.ultimoLogin,
    creadoEn: detail.creadoEn ?? "",
  } as UsuarioResponse);

  return (
    <section className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight dark:text-neutral-100">
            {detail.apellido}, {detail.nombre}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{detail.dni}</p>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-xl bg-linear-to-br from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] cursor-pointer"
            >
              Editar
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-neutral-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60 md:grid-cols-2">
        {[
          { label: "Rol", value: detail.rol !== undefined ? rolLabel(detail.rol) : "-" },
          { label: "Telefono", value: detail.telefono ?? "-" },
          {
            label: "Activo",
            value: (
              <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                Si
              </span>
            ),
          },
          {
            label: detail.rol === Rol.SUPERVISOR ? "Jefe de Supervisor" : "Supervisor",
            value: supervisor ? `${supervisor.apellido}, ${supervisor.nombre}` : "-",
          },
        ].map(({ label, value }) => (
          <div key={label} className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {label}
            </div>
            <div className="font-medium text-neutral-900 dark:text-neutral-100">{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
