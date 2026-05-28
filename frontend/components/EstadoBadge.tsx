import { EstadoVenta } from "@/types/enums";

const ESTADO_STYLES: Record<EstadoVenta, string> = {
  [EstadoVenta.PENDIENTE]:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  [EstadoVenta.INICIADA]:
    "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  [EstadoVenta.PREVENTA]:
    "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
  [EstadoVenta.CUMPLIDA]:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  [EstadoVenta.TICKET]:
    "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  [EstadoVenta.CANCELADA]:
    "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  [EstadoVenta.RECHAZADA]:
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

export default function EstadoBadge({ estado }: { estado: EstadoVenta }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_STYLES[estado] ?? ""}`}
    >
      {estado}
    </span>
  );
}
