"use client";

import { CatalogosResponse } from "@/app/actions/catalogo";
import { obtenerMisAsesores } from "@/app/actions/usuarios";
import { VentaFilters } from "@/app/actions/ventas";
import VentaExportModal from "@/components/VentaExportModal";
import VentaForm from "@/components/VentaForm";
import { VentaDetailSkeleton } from "@/components/Skeleton";
import VentaDetailView from "@/components/VentaDetailView";
import VentaFiltersPanel from "@/components/VentaFilters";
import VentaSavedViews from "@/components/VentaSavedViews";
import VentaTable from "@/components/VentaTable";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useVentaExport } from "@/hooks/useVentaExport";
import { useVentaFilters } from "@/hooks/useVentaFilters";
import { useVentaPanel } from "@/hooks/useVentaPanel";
import { useVentaViews } from "@/hooks/useVentaViews";
import {
  AsesorOption,
  PageResponse,
  UsuarioAuthResponse,
  UsuarioSupervisorResponse,
  VentaResponse,
} from "@/types/dtos";
import { Rol } from "@/types/enums";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const currentUser = useCurrentUser();

  const puedeCrearVenta =
    currentUser?.rol === Rol.ASESOR || currentUser?.rol === Rol.SUPERVISOR;
  const esSupervisor = currentUser?.rol === Rol.SUPERVISOR;

  const scopeLocked =
    scopedCurrentUser?.rol === Rol.ASESOR ||
    scopedCurrentUser?.rol === Rol.SUPERVISOR ||
    scopedCurrentUser?.rol === Rol.JEFE_DE_SUPERVISOR;

  const [createOpen, setCreateOpen] = useState(false);
  const [misAsesores, setMisAsesores] = useState<UsuarioSupervisorResponse[]>([]);

  const { panel, openDetail, closePanel } = useVentaPanel();
  const {
    exportOpen, setExportOpen,
    exportMonth, setExportMonth,
    exportYear, setExportYear,
    isExporting, today, handleExport,
  } = useVentaExport();

  const {
    applyFilters,
    applyFilterDebounced,
    clearFilters,
    loadView,
    hasFilters,
    filterExtraParams,
  } = useVentaFilters(filters, currentSize);

  const { views, saveView, deleteView } = useVentaViews(currentUser?.dni);

  // Load asesores when supervisor opens the create modal
  useEffect(() => {
    if (esSupervisor && createOpen && misAsesores.length === 0) {
      obtenerMisAsesores().then(setMisAsesores);
    }
  }, [esSupervisor, createOpen, misAsesores.length]);

  // Handle URL params ?nueva=true / ?export=true
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
  }, [searchParams, router, puedeCrearVenta, setExportOpen]);

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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v6.69l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72V3.75A.75.75 0 0 1 10 3ZM3.75 15a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Z" clipRule="evenodd" />
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

      <VentaExportModal
        open={exportOpen}
        month={exportMonth}
        year={exportYear}
        today={today}
        onClose={() => setExportOpen(false)}
        onMonthChange={setExportMonth}
        onYearChange={setExportYear}
        onExport={handleExport}
      />

      <VentaForm
        open={createOpen}
        esSupervisor={esSupervisor}
        misAsesores={misAsesores}
        catalogos={catalogos}
        currentPage={currentPage}
        currentSize={currentSize}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
