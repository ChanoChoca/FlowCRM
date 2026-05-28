"use client";

import { AlertTriangle, Info, XCircle } from "lucide-react";
import type { Alerta } from "@/types/dashboard";
import { severidadColor } from "../utils";

function AlertIcon({ severidad }: { severidad: string }) {
  const s = severidad.toLowerCase();
  if (s === "error" || s === "critico") return <XCircle className="h-4 w-4" />;
  if (s === "warn" || s === "warning" || s === "advertencia") return <AlertTriangle className="h-4 w-4" />;
  return <Info className="h-4 w-4" />;
}

export default function AlertBanner({ alertas }: { alertas: Alerta[] }) {
  if (!alertas.length) return null;

  return (
    <div className="flex flex-col gap-2">
      {alertas.map((alerta, i) => {
        const colors = severidadColor(alerta.severidad);
        return (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-xl border ${colors.border} ${colors.bg} px-4 py-3 backdrop-blur-sm`}
          >
            <span className={colors.icon}>
              <AlertIcon severidad={alerta.severidad} />
            </span>
            <p className={`text-sm ${colors.text}`}>{alerta.mensaje}</p>
          </div>
        );
      })}
    </div>
  );
}
