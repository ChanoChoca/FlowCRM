import {
  Plus,
  Eye,
  Download,
  CheckCircle,
  Users,
  UserPlus,
  User,
  ShoppingCart,
  BarChart3,
  FileText,
  Settings,
  Zap,
  Target,
  TrendingUp,
  List,
  Map,
  Megaphone,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  plus: Plus,
  nueva_venta: Plus,
  eye: Eye,
  ver: Eye,
  download: Download,
  exportar: Download,
  check: CheckCircle,
  aprobar: CheckCircle,
  users: Users,
  usuarios: Users,
  "user-plus": UserPlus,
  user: User,
  cart: ShoppingCart,
  ventas: ShoppingCart,
  chart: BarChart3,
  "bar-chart": BarChart3,
  reportes: BarChart3,
  file: FileText,
  settings: Settings,
  zap: Zap,
  target: Target,
  trending: TrendingUp,
  list: List,
  map: Map,
  megaphone: Megaphone,
  "credit-card": CreditCard,
};

export function getIconForCode(code: string): LucideIcon {
  const lower = code.toLowerCase();
  return ICON_MAP[lower] ?? Zap;
}

export function estadoColor(estado: string) {
  switch (estado.toLowerCase()) {
    case "excelente":
    case "cumplida":
    case "verde":
    case "bueno":
      return { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200/80 dark:border-emerald-800/50" };
    case "bueno_parcial":
    case "en_camino":
    case "amarillo":
    case "riesgo":
      return { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200/80 dark:border-amber-800/50" };
    case "critico":
    case "rojo":
    case "alerta":
      return { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-400", border: "border-red-200/80 dark:border-red-800/50" };
    case "neutro":
    case "info":
    case "azul":
      return { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200/80 dark:border-blue-800/50" };
    default:
      return { bg: "bg-neutral-50 dark:bg-neutral-900/60", text: "text-neutral-700 dark:text-neutral-300", border: "border-neutral-200/80 dark:border-neutral-700/50" };
  }
}

export function tendenciaColor(pct: number | null) {
  if (pct === null) return "text-neutral-400 dark:text-neutral-500";
  if (pct > 0) return "text-emerald-600 dark:text-emerald-400";
  if (pct < 0) return "text-red-500 dark:text-red-400";
  return "text-neutral-400 dark:text-neutral-500";
}

export function severidadColor(severidad: string) {
  switch (severidad.toLowerCase()) {
    case "error":
    case "critico":
      return { bg: "bg-red-50 dark:bg-red-950/40", border: "border-red-200/80 dark:border-red-800/50", text: "text-red-800 dark:text-red-300", icon: "text-red-500 dark:text-red-400" };
    case "warn":
    case "warning":
    case "advertencia":
      return { bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200/80 dark:border-amber-800/50", text: "text-amber-800 dark:text-amber-300", icon: "text-amber-500 dark:text-amber-400" };
    default:
      return { bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-blue-200/80 dark:border-blue-800/50", text: "text-blue-800 dark:text-blue-300", icon: "text-blue-500 dark:text-blue-400" };
  }
}

export const CHART_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#f97316", "#eab308",
  "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
];

export function fmtNumber(n: number) {
  return new Intl.NumberFormat("es-AR").format(n);
}

export function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}

export function fmtDateShort(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

export function fmtInstant(instant: string | null): string {
  if (!instant) return "—";
  const d = new Date(instant);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}
