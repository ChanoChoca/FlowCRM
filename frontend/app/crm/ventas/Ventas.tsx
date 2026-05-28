"use client";

import { CatalogosResponse } from "@/app/actions/catalogo";
import { obtenerMisAsesores } from "@/app/actions/usuarios";
import {
  crearVenta,
  obtenerVentaPorId,
  VentaActionState,
  VentaFilters,
} from "@/app/actions/ventas";
import Field from "@/components/Field";
import Modal from "@/components/Modal";
import SelectField from "@/components/SelectField";
import { VentaDetailSkeleton } from "@/components/Skeleton";
import TextAreaField from "@/components/TextAreaField";
import VentaDetailView from "@/components/VentaDetailView";
import VentaFiltersPanel from "@/components/VentaFilters";
import VentaSavedViews from "@/components/VentaSavedViews";
import VentaTable from "@/components/VentaTable";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useObservaciones } from "@/hooks/useObservaciones";
import { useOfflineVentas } from "@/hooks/useOfflineVentas";
import { useVentaFilters } from "@/hooks/useVentaFilters";
import { useVentaViews } from "@/hooks/useVentaViews";
import { useToast } from "@/layout/ToastProvider";
import { enumToOptions } from "@/lib/option";
import {
  validateField,
  validateVenta,
  VentaErrors,
} from "@/lib/ventas.validation";
import {
  AsesorOption,
  PageResponse,
  UsuarioAuthResponse,
  UsuarioSupervisorResponse,
  VentaDetalleResponse,
  VentaResponse,
} from "@/types/dtos";
import {
  Ani,
  AuditoriaHorario,
  AuditoriaHorarioLabel,
  InstalacionTurno,
  Origen,
  Rol,
  TipoDocumento,
  TipoTarjeta,
} from "@/types/enums";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export default function Ventas({
  ventasPage,
  currentPage,
  currentSize,
  filters,
  catalogos,
  supervisores,
  asesores,
  scopedCurrentUser,
}: {
  ventasPage: PageResponse<VentaResponse>;
  currentPage: number;
  currentSize: number;
  filters: VentaFilters;
  catalogos: CatalogosResponse;
  supervisores: UsuarioSupervisorResponse[];
  asesores: AsesorOption[];
  scopedCurrentUser?: UsuarioAuthResponse | null;
}) {
  const { show } = useToast();
  const currentUser = useCurrentUser();
  const { isOnline, enqueue } = useOfflineVentas();

  const puedeCrearVenta =
    currentUser?.rol === Rol.ASESOR || currentUser?.rol === Rol.SUPERVISOR;
  const esSupervisor = currentUser?.rol === Rol.SUPERVISOR;

  const scopeLocked =
    scopedCurrentUser?.rol === Rol.ASESOR ||
    scopedCurrentUser?.rol === Rol.SUPERVISOR ||
    scopedCurrentUser?.rol === Rol.JEFE_DE_SUPERVISOR;

  const [createOpen, setCreateOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const today = new Date();
  const [exportMonth, setExportMonth] = useState(today.getMonth() + 1);
  const [exportYear, setExportYear] = useState(today.getFullYear());
  const [misAsesores, setMisAsesores] = useState<UsuarioSupervisorResponse[]>(
    [],
  );
  const [errors, setErrors] = useState<VentaErrors>({});
  const [actionState, formAction, isPending] = useActionState<
    VentaActionState,
    FormData
  >(crearVenta, null);

  const submittedRef = useRef(false);
  const [panel, setPanel] = useState<
    | { mode: "closed" }
    | {
        mode: "view";
        id: number;
        detail: VentaDetalleResponse | null;
        loading: boolean;
      }
  >({ mode: "closed" });

  const {
    applyFilters,
    applyFilterDebounced,
    clearFilters,
    loadView,
    hasFilters,
    filterExtraParams,
  } = useVentaFilters(filters, currentSize);

  const { views, saveView, deleteView } = useVentaViews(currentUser?.dni);

  const [isExporting, setIsExporting] = useState(false);

  async function handleExport(month: number, year: number) {
    setIsExporting(true);
    setExportOpen(false);
    try {
      const params = new URLSearchParams();
      const desde = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const hasta = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      params.set("desde", desde);
      params.set("hasta", hasta);
      const url = `/api/reportes/ventas?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al exportar");
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      link.download = match?.[1] ?? "ventas.xlsx";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      show("No se pudo exportar el reporte", "error");
    } finally {
      setIsExporting(false);
    }
  }

  const { updateObs, resetObs, computedObservaciones } = useObservaciones();

  useEffect(() => {
    if (esSupervisor && createOpen && misAsesores.length === 0) {
      obtenerMisAsesores().then(setMisAsesores);
    }
  }, [esSupervisor, createOpen, misAsesores.length]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const triggeredRef = useRef(false);
  useEffect(() => {
    if (triggeredRef.current) return;
    const nueva = searchParams.get("nueva") === "true";
    const exportar = searchParams.get("export") === "true";
    if (!nueva && !exportar) return;
    triggeredRef.current = true;
    if (nueva && puedeCrearVenta) setCreateOpen(true);
    if (exportar) setExportOpen(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("nueva");
    params.delete("export");
    const qs = params.toString();
    router.replace(qs ? `/crm/ventas?${qs}` : "/crm/ventas", { scroll: false });
  }, [searchParams, router, puedeCrearVenta]);

  useEffect(() => {
    if (!submittedRef.current) return;
    if (isPending) return;
    submittedRef.current = false;
    if (actionState?.error) {
      show(actionState.error, "error");
    } else {
      show("Venta creada exitosamente", "success");
      setCreateOpen(false);
      setErrors({});
      resetObs();
    }
  }, [actionState, isPending, show, resetObs]);

  const emptyCreateKey = useMemo(
    () => `venta-create-${currentPage}-${currentSize}`,
    [currentPage, currentSize],
  );

  const openDetail = useCallback(async (id: number) => {
    setPanel({ mode: "view", id, detail: null, loading: true });
    try {
      const detail = await obtenerVentaPorId(id);
      setPanel({ mode: "view", id, detail, loading: false });
    } catch {
      setPanel({ mode: "closed" });
    }
  }, []);

  const closePanel = useCallback(() => setPanel({ mode: "closed" }), []);

  function handleBlur(field: keyof VentaErrors, value: string) {
    const error = validateField(field, value);
    setErrors((prev) => {
      if (!error) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: error };
    });
  }

  function handleChange(field: keyof VentaErrors, value: string) {
    if (!errors[field]) return;
    handleBlur(field, value);
  }

  type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  function blurHandler(field: keyof VentaErrors) {
    return (e: React.FocusEvent<FormElement>) =>
      handleBlur(field, e.target.value);
  }

  function changeHandler(field: keyof VentaErrors) {
    return (e: React.ChangeEvent<FormElement>) =>
      handleChange(field, e.target.value);
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const phoneParts = [
      (
        form.elements.namedItem("telefono_0") as HTMLInputElement | null
      )?.value?.trim(),
      (
        form.elements.namedItem("telefono_1") as HTMLInputElement | null
      )?.value?.trim(),
      (
        form.elements.namedItem("telefono_2") as HTMLInputElement | null
      )?.value?.trim(),
    ].filter(Boolean);
    (form.elements.namedItem("cliente.telefono") as HTMLInputElement).value =
      phoneParts.join(" - ");

    const data = new FormData(form);
    const newErrors = validateVenta(data, esSupervisor);
    if (Object.keys(newErrors).length > 0) {
      e.preventDefault();
      setErrors(newErrors);
      show("Revisá los campos marcados", "error");
      return;
    }

    if (!isOnline) {
      e.preventDefault();
      const contactoRaw = data.get("contacto") as AuditoriaHorario;
      const auditoriaLabel = contactoRaw
        ? AuditoriaHorarioLabel[contactoRaw]
        : "";
      const atencion = (data.get("instalacionTurno") as string) ?? "";
      enqueue({
        promoId: Number(data.get("promoId")),
        centralId: Number(data.get("centralId")),
        ani: data.get("ani") as Ani,
        decos: Number(data.get("decos")),
        contacto: contactoRaw,
        origen: Origen.CRM,
        observaciones: `horario de auditoría: ${auditoriaLabel}\nhorario de atención: ${atencion}`,
        cliente: {
          id: null,
          nombre: (data.get("cliente.nombre") as string) ?? "",
          tipoDocumento: TipoDocumento.DNI,
          numeroDocumento:
            (data.get("cliente.numeroDocumento") as string) ?? "",
          telefono: (data.get("cliente.telefono") as string) ?? "",
          email: (data.get("cliente.email") as string) ?? "",
          domicilio: {
            id: null,
            calle: (data.get("cliente.domicilio.calle") as string) ?? "",
            numero: (data.get("cliente.domicilio.numero") as string) ?? "",
            piso: (data.get("cliente.domicilio.piso") as string) || null,
            depto: (data.get("cliente.domicilio.depto") as string) || null,
            entreCalles1:
              (data.get("cliente.domicilio.entreCalles1") as string) ?? "",
            entreCalles2:
              (data.get("cliente.domicilio.entreCalles2") as string) ?? "",
            entreCalles3:
              (data.get("cliente.domicilio.entreCalles3") as string) ?? "",
            coordenadas:
              (data.get("cliente.domicilio.coordenadas") as string) || null,
            localidad:
              (data.get("cliente.domicilio.localidad") as string) ?? "",
            codigoPostal:
              (data.get("cliente.domicilio.codigoPostal") as string) ?? "",
            provincia: {
              id: Number(data.get("cliente.domicilio.provinciaId")),
              nombre: "",
            },
            observaciones:
              (data.get("cliente.domicilio.observaciones") as string) || null,
          },
        } as any,
        pago: {
          id: 0,
          debitoAutomatico: false,
          tipoTarjeta: (data.get("pago.tipoTarjeta") as any) || null,
          banco: (data.get("pago.banco") as string) ?? "",
          numeroTarjeta: (data.get("pago.numeroTarjeta") as string) ?? "",
          titular: (data.get("pago.titular") as string) ?? "",
        } as any,
        fechaNacimiento:
          (data.get("cliente.fechaNacimiento") as string) || null,
        miga: (data.get("cliente.domicilio.miga") as string) || null,
      });
      show(
        "Sin conexión — venta guardada localmente. Se sincronizará al recuperar la red.",
        "warn",
      );
      setCreateOpen(false);
      setErrors({});
      resetObs();
      return;
    }

    submittedRef.current = true;
  }

  function handleClose() {
    setCreateOpen(false);
    setErrors({});
    resetObs();
  }

  useKeyboardShortcuts([
    {
      key: "n",
      ignoreWhenTyping: true,
      description: "Nueva venta",
      handler: () => {
        if (puedeCrearVenta && !createOpen) setCreateOpen(true);
      },
    },
    {
      key: "e",
      ignoreWhenTyping: true,
      description: "Exportar Excel",
      handler: () => {
        if (!isExporting) setExportOpen(true);
      },
    },
    {
      key: "Escape",
      description: "Cerrar panel de detalle",
      handler: () => {
        if (panel.mode !== "closed") closePanel();
      },
    },
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight dark:text-neutral-100">
            Ventas
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Listado paginado y creación de ventas.
          </p>
        </div>
        {puedeCrearVenta && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-xl bg-linear-to-br from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] cursor-pointer"
          >
            Nueva venta
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setExportOpen(true)}
          disabled={isExporting}
          className="flex items-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M10 3a.75.75 0 0 1 .75.75v6.69l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72V3.75A.75.75 0 0 1 10 3ZM3.75 15a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Z"
              clipRule="evenodd"
            />
          </svg>
          {isExporting ? "Exportando…" : "Exportar Excel"}
        </button>
      </div>

      <VentaSavedViews
        views={views}
        currentFilters={filters}
        hasFilters={hasFilters}
        onLoad={loadView}
        onSave={saveView}
        onDelete={deleteView}
      />

      <VentaFiltersPanel
        filters={filters}
        onDebounced={applyFilterDebounced}
        onImmediate={applyFilters}
        onClear={clearFilters}
        hasFilters={hasFilters}
        supervisores={supervisores}
        asesores={asesores}
        userRole={currentUser?.rol}
        scopeLocked={scopeLocked}
      />

      <VentaTable
        ventasPage={ventasPage}
        currentPage={currentPage}
        currentSize={currentSize}
        extraParams={filterExtraParams}
        onVerDetalle={openDetail}
      />

      {panel.mode === "view" && (
        <>
          <div
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/30 backdrop-blur-sm"
            onClick={closePanel}
          />
          <div className="fixed bottom-0 right-0 top-16 z-50 flex w-full max-w-2xl flex-col overflow-y-auto border-l border-neutral-200/80 bg-white shadow-2xl dark:border-neutral-700/50 dark:bg-neutral-950">
            {panel.loading ? (
              <VentaDetailSkeleton />
            ) : (
              panel.detail && (
                <VentaDetailView
                  detail={panel.detail}
                  currentPage={currentPage}
                  currentSize={currentSize}
                  onClose={closePanel}
                />
              )
            )}
          </div>
        </>
      )}

      <Modal
        open={exportOpen}
        title="Exportar Excel"
        onClose={() => setExportOpen(false)}
      >
        <div className="grid gap-6">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Seleccioná el mes y año para exportar las ventas del período.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Mes
              </label>
              <select
                value={exportMonth}
                onChange={(e) => setExportMonth(Number(e.target.value))}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {[
                  "Enero",
                  "Febrero",
                  "Marzo",
                  "Abril",
                  "Mayo",
                  "Junio",
                  "Julio",
                  "Agosto",
                  "Septiembre",
                  "Octubre",
                  "Noviembre",
                  "Diciembre",
                ].map((name, i) => (
                  <option key={i + 1} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Año
              </label>
              <select
                value={exportYear}
                onChange={(e) => setExportYear(Number(e.target.value))}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => today.getFullYear() - 2 + i,
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setExportOpen(false)}
              className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => handleExport(exportMonth, exportYear)}
              className="flex items-center gap-1.5 rounded-xl bg-linear-to-br from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a.75.75 0 0 1 .75.75v6.69l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72V3.75A.75.75 0 0 1 10 3ZM3.75 15a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Z"
                  clipRule="evenodd"
                />
              </svg>
              Exportar
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={createOpen} title="Crear venta" onClose={handleClose}>
        <form
          action={formAction}
          key={emptyCreateKey}
          onSubmit={handleSubmit}
          className="grid gap-4 sm:gap-6"
        >
          <section className="grid gap-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3 sm:p-4 dark:border-neutral-700/50 dark:bg-neutral-800/30">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
              Datos de la venta
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {esSupervisor && (
                <SelectField
                  className="sm:col-span-2"
                  label="Asesor"
                  name="asesorId"
                  options={misAsesores.map((a) => ({
                    value: a.id!,
                    label: `${a.nombre} ${a.apellido}`,
                  }))}
                  required
                  error={errors["asesorId"]}
                  onBlur={blurHandler("asesorId")}
                  onChange={changeHandler("asesorId")}
                />
              )}
              <SelectField
                label="Promo"
                name="promoId"
                options={catalogos.promos.map((p) => ({
                  value: p.id,
                  label: p.nombre,
                }))}
                required
                error={errors["promoId"]}
                onBlur={blurHandler("promoId")}
                onChange={changeHandler("promoId")}
              />
              <SelectField
                label="Central"
                name="centralId"
                options={catalogos.centrales.map((c) => ({
                  value: c.id,
                  label: c.nombre,
                }))}
                required
                error={errors["centralId"]}
                onBlur={blurHandler("centralId")}
                onChange={(e) => {
                  changeHandler("centralId")(e);
                  const central = catalogos.centrales.find(
                    (c) => String(c.id) === e.target.value,
                  );
                  updateObs("centralNombre", central?.nombre ?? "");
                }}
              />
              <SelectField
                label="ANI"
                name="ani"
                options={enumToOptions(Ani)}
                required
                error={errors["ani"]}
                onBlur={blurHandler("ani")}
                onChange={changeHandler("ani")}
              />
              <Field
                label="Decos"
                name="decos"
                type="number"
                min={0}
                max={3}
                step={1}
                required
                error={errors["decos"]}
                onBlur={blurHandler("decos")}
                onChange={changeHandler("decos")}
              />
              <SelectField
                label="Horario de auditoría"
                name="contacto"
                options={Object.values(AuditoriaHorario).map((v) => ({
                  value: v,
                  label: AuditoriaHorarioLabel[v],
                }))}
                required
                error={errors["contacto"]}
                onBlur={blurHandler("contacto")}
                onChange={changeHandler("contacto")}
              />
              <SelectField
                label="Horario de instalación"
                name="instalacionTurno"
                options={enumToOptions(InstalacionTurno)}
                required
                onChange={(e) => updateObs("instalacionTurno", e.target.value)}
              />
            </div>
          </section>

          <section className="grid gap-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3 sm:p-4 dark:border-neutral-700/50 dark:bg-neutral-800/30">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
              Cliente
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nombre"
                name="cliente.nombre"
                required
                error={errors["cliente.nombre"]}
                onBlur={blurHandler("cliente.nombre")}
                onChange={changeHandler("cliente.nombre")}
              />
              <Field
                label="Numero documento"
                name="cliente.numeroDocumento"
                required
                error={errors["cliente.numeroDocumento"]}
                onBlur={blurHandler("cliente.numeroDocumento")}
                onChange={changeHandler("cliente.numeroDocumento")}
              />
              <Field
                label="Teléfono 1"
                name="telefono_0"
                required
                error={errors["telefono_0"]}
                onBlur={blurHandler("telefono_0")}
                onChange={changeHandler("telefono_0")}
              />
              <Field
                label="Teléfono 2 (opcional)"
                name="telefono_1"
                error={errors["telefono_1"]}
                onBlur={blurHandler("telefono_1")}
                onChange={changeHandler("telefono_1")}
              />
              <Field
                label="Teléfono 3 (opcional)"
                name="telefono_2"
                error={errors["telefono_2"]}
                onBlur={blurHandler("telefono_2")}
                onChange={changeHandler("telefono_2")}
              />
              <input type="hidden" name="cliente.telefono" />
              <Field
                label="Fecha de nacimiento"
                name="cliente.fechaNacimiento"
                type="date"
                required
                error={errors["cliente.fechaNacimiento"]}
                onBlur={blurHandler("cliente.fechaNacimiento")}
                onChange={(e) => {
                  changeHandler("cliente.fechaNacimiento")(e);
                  updateObs("fechaNacimiento", e.target.value);
                }}
              />
              <Field
                label="Email"
                name="cliente.email"
                type="email"
                required
                error={errors["cliente.email"]}
                onBlur={blurHandler("cliente.email")}
                onChange={changeHandler("cliente.email")}
              />
              <SelectField
                label="Provincia"
                name="cliente.domicilio.provinciaId"
                options={catalogos.provincias.map((p) => ({
                  value: p.id,
                  label: p.nombre,
                }))}
                required
                error={errors["cliente.domicilio.provinciaId"]}
                onBlur={blurHandler("cliente.domicilio.provinciaId")}
                onChange={changeHandler("cliente.domicilio.provinciaId")}
              />
              <Field
                label="Calle"
                name="cliente.domicilio.calle"
                required
                error={errors["cliente.domicilio.calle"]}
                onBlur={blurHandler("cliente.domicilio.calle")}
                onChange={(e) => {
                  changeHandler("cliente.domicilio.calle")(e);
                  updateObs("calle", e.target.value);
                }}
              />
              <Field
                label="Numero"
                name="cliente.domicilio.numero"
                required
                error={errors["cliente.domicilio.numero"]}
                onBlur={blurHandler("cliente.domicilio.numero")}
                onChange={changeHandler("cliente.domicilio.numero")}
              />
              <Field label="Piso" name="cliente.domicilio.piso" />
              <Field label="Depto" name="cliente.domicilio.depto" />
              <Field
                label="Entre calles 1"
                name="cliente.domicilio.entreCalles1"
                required
                error={errors["cliente.domicilio.entreCalles1"]}
                onBlur={blurHandler("cliente.domicilio.entreCalles1")}
                onChange={changeHandler("cliente.domicilio.entreCalles1")}
              />
              <Field
                label="Entre calles 2"
                name="cliente.domicilio.entreCalles2"
                required
                error={errors["cliente.domicilio.entreCalles2"]}
                onBlur={blurHandler("cliente.domicilio.entreCalles2")}
                onChange={changeHandler("cliente.domicilio.entreCalles2")}
              />
              <Field
                label="Entre calles 3"
                name="cliente.domicilio.entreCalles3"
                required
                error={errors["cliente.domicilio.entreCalles3"]}
                onBlur={blurHandler("cliente.domicilio.entreCalles3")}
                onChange={changeHandler("cliente.domicilio.entreCalles3")}
              />
              <Field
                label="Localidad"
                name="cliente.domicilio.localidad"
                required
                error={errors["cliente.domicilio.localidad"]}
                onBlur={blurHandler("cliente.domicilio.localidad")}
                onChange={(e) => {
                  changeHandler("cliente.domicilio.localidad")(e);
                  updateObs("localidad", e.target.value);
                }}
              />
              <Field
                label="Codigo postal"
                name="cliente.domicilio.codigoPostal"
                required
                error={errors["cliente.domicilio.codigoPostal"]}
                onBlur={blurHandler("cliente.domicilio.codigoPostal")}
                onChange={changeHandler("cliente.domicilio.codigoPostal")}
              />
              <Field
                label="Coordenadas"
                name="cliente.domicilio.coordenadas"
                type="text"
                required
                inputMode="decimal"
                error={errors["cliente.domicilio.coordenadas"]}
                onBlur={blurHandler("cliente.domicilio.coordenadas")}
                onChange={(e) => {
                  changeHandler("cliente.domicilio.coordenadas")(e);
                  updateObs("coordenadas", e.target.value);
                }}
              />
              <TextAreaField
                className="sm:col-span-2"
                label="Miga"
                name="cliente.domicilio.miga"
                required
                onChange={(e) => {
                  changeHandler("cliente.domicilio.miga")(e);
                  updateObs("miga", e.target.value);
                }}
              />
            </div>
          </section>

          <section className="grid gap-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3 sm:p-4 dark:border-neutral-700/50 dark:bg-neutral-800/30">
            <div>
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                Observaciones del domicilio
              </h3>
            </div>
            {computedObservaciones.trim() && (
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Vista previa
                </p>
                <pre className="rounded-lg bg-neutral-100 px-3 py-2 font-mono text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 overflow-x-auto whitespace-pre-wrap wrap-break-word">
                  {computedObservaciones}
                </pre>
              </div>
            )}
            <input
              type="hidden"
              name="cliente.domicilio.observaciones"
              value={computedObservaciones}
            />
          </section>

          <section className="grid gap-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-700/50 dark:bg-neutral-800/30">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
              Pago
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField
                label="Tipo tarjeta"
                name="pago.tipoTarjeta"
                options={enumToOptions(TipoTarjeta)}
                required
                error={errors["pago.tipoTarjeta"]}
                onBlur={blurHandler("pago.tipoTarjeta")}
                onChange={changeHandler("pago.tipoTarjeta")}
              />
              <Field
                label="Banco"
                name="pago.banco"
                required
                error={errors["pago.banco"]}
                onBlur={blurHandler("pago.banco")}
                onChange={changeHandler("pago.banco")}
              />
              <Field
                label="Numero tarjeta"
                name="pago.numeroTarjeta"
                required
                error={errors["pago.numeroTarjeta"]}
                onBlur={blurHandler("pago.numeroTarjeta")}
                onChange={changeHandler("pago.numeroTarjeta")}
              />
              <Field
                label="Titular"
                name="pago.titular"
                required
                error={errors["pago.titular"]}
                onBlur={blurHandler("pago.titular")}
                onChange={changeHandler("pago.titular")}
              />
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 ${
                isOnline
                  ? "bg-linear-to-br from-indigo-600 to-blue-600 shadow-indigo-500/20 hover:shadow-indigo-500/30"
                  : "bg-linear-to-br from-amber-500 to-orange-500 shadow-amber-500/20 hover:shadow-amber-500/30"
              }`}
            >
              {isPending
                ? "Guardando…"
                : isOnline
                  ? "Guardar venta"
                  : "Guardar offline"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
