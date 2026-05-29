"use client";

import { useToast } from "@/layout/ToastProvider";
import { useState } from "react";

export function useVentaExport() {
  const { show } = useToast();
  const today = new Date();
  const [exportOpen, setExportOpen] = useState(false);
  const [exportMonth, setExportMonth] = useState(today.getMonth() + 1);
  const [exportYear, setExportYear] = useState(today.getFullYear());
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
      const res = await fetch(`/api/reportes/ventas?${params.toString()}`);
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

  return {
    exportOpen,
    setExportOpen,
    exportMonth,
    setExportMonth,
    exportYear,
    setExportYear,
    isExporting,
    today,
    handleExport,
  };
}
