"use client";

import { submitOfflineVenta } from "@/app/actions/ventas";
import GlobalSearch from "@/components/GlobalSearch";
import KeyboardShortcutsPanel from "@/components/KeyboardShortcutsPanel";
import NotificationBell from "@/components/NotificationBell";
import ThemeToggle from "@/components/ThemeToggle";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useOfflineVentas } from "@/hooks/useOfflineVentas";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/layout/ToastProvider";
import { AuthService } from "@/lib/auth";
import { Rol } from "@/types/enums";
import {
  ChevronRight,
  Keyboard,
  LayoutDashboard,
  LogOut,
  Map,
  Megaphone,
  Menu,
  MessageSquare,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

const allNavItems = [
  { href: "/crm", label: "Dashboard", icon: LayoutDashboard, roles: null },
  { href: "/crm/ventas", label: "Ventas", icon: ShoppingCart, roles: null },
  {
    href: "/crm/mapa",
    label: "Mapa",
    icon: Map,
    roles: [
      Rol.SUPERVISOR,
      Rol.JEFE_DE_SUPERVISOR,
      Rol.GERENTE,
      Rol.LIDER,
      Rol.ADMINISTRACION_RRHH_COBRANZA,
    ],
  },
  { href: "/crm/usuarios", label: "Usuarios", icon: Users, roles: null },
  { href: "/crm/soporte", label: "Soporte", icon: MessageSquare, roles: null },
  { href: "/crm/anuncios", label: "Comunicados", icon: Megaphone, roles: null },
];

const asesorOnlyPaths = new Set(["/crm/clientes", "/crm/pagos"]);

export default function CrmShell({ children }: { children: React.ReactNode }) {
  const { show } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const currentUser = useCurrentUser();

  const navItems = useMemo(() => {
    return allNavItems.filter((item) => {
      if (asesorOnlyPaths.has(item.href) && currentUser?.rol !== Rol.ASESOR)
        return false;
      if (
        item.roles &&
        currentUser?.rol &&
        !item.roles.includes(currentUser.rol)
      )
        return false;
      return true;
    });
  }, [currentUser]);

  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    startTransition(async () => {
      const result = await AuthService.logout();

      show(result.message, result.type);

      if (result.type === "success") {
        window.location.href = "/iniciar-sesion";
      }
    });
  };

  const isActive = (href: string) =>
    href === "/crm"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  // Chord state for two-key "G + x" navigation shortcuts
  const { isOnline, pending, sync } = useOfflineVentas();

  useEffect(() => {
    if (isOnline && pending.length > 0) {
      sync(submitOfflineVenta).then(({ synced }) => {
        if (synced > 0) {
          show(
            `${synced} ${synced === 1 ? "venta sincronizada" : "ventas sincronizadas"} correctamente`,
            "success",
          );
        }
      });
    }
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  const [gPressed, setGPressed] = useState(false);

  useEffect(() => {
    if (!gPressed) return;
    const timer = setTimeout(() => setGPressed(false), 1000);
    return () => clearTimeout(timer);
  }, [gPressed]);

  useKeyboardShortcuts([
    {
      key: "?",
      ignoreWhenTyping: true,
      description: "Abrir panel de atajos",
      handler: () => setShortcutsOpen((v) => !v),
    },
    {
      key: "g",
      ignoreWhenTyping: true,
      description: "Iniciar chord de navegación",
      handler: () => setGPressed(true),
    },
  ]);

  useEffect(() => {
    if (!gPressed) return;
    const CHORD_MAP: Record<string, string> = {
      d: "/crm",
      v: "/crm/ventas",
      u: "/crm/usuarios",
      s: "/crm/soporte",
    };
    function onKey(e: KeyboardEvent) {
      const dest = CHORD_MAP[e.key.toLowerCase()];
      if (dest) {
        e.preventDefault();
        router.push(dest);
      }
      setGPressed(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gPressed, router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 via-neutral-50 to-neutral-100 text-neutral-900 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 dark:text-neutral-100">
      <header className="sticky top-0 z-1000 h-16 border-b border-neutral-200/70 bg-white/80 backdrop-blur-xl dark:border-neutral-800/70 dark:bg-neutral-900/80">
        <div className="mx-auto flex h-full w-full max-w-400 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200/80 bg-white/60 shadow-sm backdrop-blur transition-all hover:scale-105 hover:shadow-md active:scale-95 dark:border-neutral-700/80 dark:bg-neutral-800/60 lg:hidden cursor-pointer"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>

            <Link href="/crm" className="hidden lg:block">
              <Image
                src="/images/logo/logo.svg"
                alt="FlowCRM Logo"
                width={2000}
                height={419}
                priority
                className="h-8 w-auto dark:hidden"
              />
              <Image
                src="/images/logo/logo.svg"
                alt="FlowCRM Logo"
                width={2000}
                height={419}
                priority
                className="hidden h-8 w-auto dark:block"
              />
            </Link>
          </div>

          <GlobalSearch />

          <div className="flex items-center gap-2">
            <NotificationBell />

            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              className="group inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200/80 bg-white/60 shadow-sm backdrop-blur transition-all hover:scale-105 hover:shadow-md active:scale-95 dark:border-neutral-700/80 dark:bg-neutral-800/60 cursor-pointer"
              aria-label="Atajos de teclado"
              title="Atajos de teclado (?)"
            >
              <Keyboard className="h-4 w-4" />
            </button>

            <ThemeToggle theme={theme} background={true} onChange={setTheme} />
          </div>
        </div>
      </header>

      {!isOnline && (
        <div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-xs font-semibold text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 shrink-0"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clipRule="evenodd"
            />
          </svg>
          Sin conexión — modo offline activo
          {pending.length > 0 && (
            <span className="ml-1 rounded-full bg-white/30 px-2 py-0.5">
              {pending.length}{" "}
              {pending.length === 1 ? "venta pendiente" : "ventas pendientes"}
            </span>
          )}
        </div>
      )}
      {isOnline && pending.length > 0 && (
        <div className="flex items-center justify-center gap-2 bg-indigo-600 px-4 py-2 text-xs font-semibold text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 shrink-0 animate-spin"
          >
            <path
              fillRule="evenodd"
              d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
              clipRule="evenodd"
            />
          </svg>
          Sincronizando {pending.length}{" "}
          {pending.length === 1
            ? "venta guardada offline"
            : "ventas guardadas offline"}
          …
        </div>
      )}

      <div className="mx-auto flex w-full max-w-400">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col border-r border-neutral-200/70 bg-white/50 backdrop-blur-sm dark:border-neutral-800/70 dark:bg-neutral-900/50">
            <div className="px-3 pt-6 pb-2">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Navegación
              </p>
            </div>

            <nav className="flex flex-col gap-0.5 px-3">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                      active
                        ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/25 dark:bg-white dark:text-neutral-900 dark:shadow-white/10"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-neutral-100"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        active
                          ? "bg-white/20 dark:bg-neutral-900/20"
                          : "bg-neutral-100 group-hover:bg-neutral-200 dark:bg-neutral-800 dark:group-hover:bg-neutral-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {label}
                    {active && (
                      <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-neutral-200/70 p-3 dark:border-neutral-800/70">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isPending}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-neutral-500 transition-all hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 transition-colors group-hover:bg-red-100 dark:bg-neutral-800 dark:group-hover:bg-red-950/50">
                  <LogOut className="h-4 w-4" />
                </div>
                {isPending ? "Saliendo..." : "Cerrar sesión"}
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      {shortcutsOpen && (
        <KeyboardShortcutsPanel onClose={() => setShortcutsOpen(false)} />
      )}

      {open && (
        <div className="fixed inset-0 z-1000 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in cursor-pointer"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[80%] max-w-xs flex-col bg-white/95 shadow-2xl backdrop-blur-xl animate-slide-in-left dark:bg-neutral-900/95">
            <div className="flex h-16 items-center justify-between border-b border-neutral-200/70 px-4 dark:border-neutral-800/70">
              <Link href="/crm" className="lg:hidden block">
                <Image
                  src="/images/logo/logo.svg"
                  alt="FlowCRM Logo"
                  width={2000}
                  height={419}
                  priority
                  className="h-8 w-auto dark:hidden"
                />
                <Image
                  src="/images/logo/logo.svg"
                  alt="FlowCRM Logo"
                  width={2000}
                  height={419}
                  priority
                  className="hidden h-8 w-auto dark:block"
                />
              </Link>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200/80 transition-all hover:scale-105 hover:bg-neutral-100 active:scale-95 dark:border-neutral-700/80 dark:hover:bg-neutral-800 cursor-pointer"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-3 pt-6 pb-2">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Navegación
              </p>
            </div>

            <nav className="flex flex-1 flex-col gap-0.5 px-3">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold transition-all duration-200 ${
                      active
                        ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/25 dark:bg-white dark:text-neutral-900 dark:shadow-white/10"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-neutral-100"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        active
                          ? "bg-white/20 dark:bg-neutral-900/20"
                          : "bg-neutral-100 group-hover:bg-neutral-200 dark:bg-neutral-800 dark:group-hover:bg-neutral-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {label}
                    {active && (
                      <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-neutral-200/70 p-3 dark:border-neutral-800/70">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isPending}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold text-neutral-500 transition-all hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 cursor-pointer"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 transition-colors group-hover:bg-red-100 dark:bg-neutral-800 dark:group-hover:bg-red-950/50">
                  <LogOut className="h-4 w-4" />
                </div>
                {isPending ? "Saliendo..." : "Cerrar sesión"}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
