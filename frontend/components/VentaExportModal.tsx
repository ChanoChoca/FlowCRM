"use client";

import Modal from "@/components/Modal";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface Props {
  open: boolean;
  month: number;
  year: number;
  today: Date;
  onClose: () => void;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
  onExport: (month: number, year: number) => void;
}

export default function VentaExportModal({
  open,
  month,
  year,
  today,
  onClose,
  onMonthChange,
  onYearChange,
  onExport,
}: Props) {
  return (
    <Modal open={open} title="Exportar Excel" onClose={onClose}>
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
              value={month}
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              {MESES.map((name, i) => (
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
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 transition-colors focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            >
              {Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i).map(
                (y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onExport(month, year)}
            className="flex items-center gap-1.5 rounded-xl bg-linear-to-br from-indigo-600 to-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v6.69l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72V3.75A.75.75 0 0 1 10 3ZM3.75 15a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H3.75Z" clipRule="evenodd" />
            </svg>
            Exportar
          </button>
        </div>
      </div>
    </Modal>
  );
}
