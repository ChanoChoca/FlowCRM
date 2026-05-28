"use client";

import EstadoBadge from "@/components/EstadoBadge";
import Pagination from "@/components/Pagination";
import { PageResponse, VentaResponse } from "@/types/dtos";

export default function VentaTable({
  ventasPage,
  currentPage,
  currentSize,
  extraParams,
  onVerDetalle,
}: {
  ventasPage: PageResponse<VentaResponse>;
  currentPage: number;
  currentSize: number;
  extraParams: Record<string, string>;
  onVerDetalle: (id: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/80 shadow-sm backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700/50">
          <thead className="bg-neutral-50/80 dark:bg-neutral-800/50">
            <tr>
              {[
                "ID",
                "Creado",
                "Cliente",
                "Promo",
                "Asesor",
                "Supervisor",
                "Estado",
                "Acciones",
              ].map((h) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 ${h === "Acciones" ? "text-right" : "text-left"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
            {ventasPage.content.map((venta) => (
              <tr
                key={venta.id}
                className="transition-colors duration-150 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30"
              >
                <td className="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {venta.id}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                  {venta.creadoEn
                    ? (() => {
                        const d = new Date(venta.creadoEn);
                        const h = d.getHours();
                        const h12 = h % 12 || 12;
                        const m = d.getMinutes();
                        const period = h < 12 ? "a. m." : "p. m.";
                        return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}, ${h12}:${String(m).padStart(2, "0")} ${period}`;
                      })()
                    : "-"}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                  {venta.clienteNombre}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                  {venta.promo}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                  {venta.asesorNombre} {venta.asesorApellido}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                  {venta.supervisorNombre} {venta.supervisorApellido}
                </td>
                <td className="px-4 py-3">
                  <EstadoBadge estado={venta.estado} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onVerDetalle(venta.id!)}
                      className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 active:scale-95 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
                    >
                      Ver
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {ventasPage.content.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-sm text-neutral-400 dark:text-neutral-500"
                >
                  No hay ventas para mostrar.
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
          totalPages={ventasPage.totalPages || 1}
          extraParams={extraParams}
        />
      </div>
    </div>
  );
}
