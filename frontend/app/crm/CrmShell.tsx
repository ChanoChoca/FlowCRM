"use client";

import { submitOfflineVenta } from "@/app/actions/ventas";
import GlobalSearch from "@/components/GlobalSearch";
import KeyboardShortcutsPanel from "@/components/KeyboardShortcutsPanel";
import NotificationBell from "@/components/NotificationBell";
import OfflineBanner from "@/components/OfflineBanner";
import ThemeToggle from "@/components/ThemeToggle";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { useChordNavigation } from "@/hooks/useChordNavigation";
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
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const currentUser = useCurrentUser();

  const navItems = useMemo(
    () =>
      allNavItems.filter((item) => {
        if (asesorOnlyPaths.has(item.href) && currentUser?.rol !== Rol.ASESOR)
          return false;
        if (item.roles && currentUser?.rol && !item.roles.includes(currentUser.rol))
          return false;
        return true;
      }),
    [currentUser],
  );

  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    startTransition(async () => {
      const result = await AuthService.logout();
      show(result.message, result.type);
      if (result.type === "success") window.location.href = "/iniciar-sesion";
    });
  };

  const isActive = (href: string) =>
    href === "/crm"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

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

  // Two-key chord navigation: G then d/v/u/s
  const [gPressed, setGPressed] = useState(false);
  const resetGPressed = useCallback(() => setGPressed(false), []);

  useEffect(() => {
    if (!gPressed) return;
    const timer = setTimeout(() => setGPressed(false), 1000);
    return () => clearTimeout(timer);
  }, [gPressed]);

  useChordNavigation(gPressed, resetGPressed);

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

  const navLinkCls = (active: boolean) =>
    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
      active
        ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/25 dark:bg-white dark:text-neutral-900 dark:shadow-white/10"
        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/80 dark:hover:text-neutral-100"
    }`;

  const iconCls = (active: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
      active
        ? "bg-white/20 dark:bg-neutral-900/20"
        : "bg-neutral-100 group-hover:bg-neutral-200 dark:bg-neutral-800 dark:group-hover:bg-neutral-700"
    }`;

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link key={href} href={href} onClick={onClick} className={navLinkCls(active)}>
            <div className={iconCls(active)}>
              <Icon className="h-4 w-4" />
            </div>
            {label}
            {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-60" />}
          </Link>
        );
      })}
    </>
  );

  const LogoutButton = ({ mobile }: { mobile?: boolean }) => (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 ${mobile ? "py-3" : "py-2.5"} text-[13px] font-semibold text-neutral-500 transition-all hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-red-950/30 dark:hover:text-red-400 cursor-pointer`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 transition-colors group-hover:bg-red-100 dark:bg-neutral-800 dark:group-hover:bg-red-950/50">
        <LogOut className="h-4 w-4" />
      </div>
      {isPending ? "Saliendo..." : "Cerrar sesión"}
    </button>
  );

  const Logo = () => (
    <Image
      src="/images/logo/logo.svg"
      alt="FlowCRM Logo"
      width={2000}
      height={419}
      priority
      className="h-8 w-auto"
    />
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 via-neutral-50 to-neutral-100 text-neutral-900 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-900 dark:text-neutral-100">
      <header className="sticky top-0 z-1000 h-16 border-b border-neutral-200/70 bg-white/80 backdrop-blur-xl dark:border-neutral-800/70 dark:bg-neutral-900/80">
        <div className="mx-auto flex h-full w-full max-w-400 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200/80 bg-white/60 shadow-sm backdrop-blur transition-all hover:scale-105 hover:shadow-md active:scale-95 dark:border-neutral-700/80 dark:bg-neutral-800/60 lg:hidden cursor-pointer"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/crm" className="hidden lg:block">
              <Logo />
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

      <OfflineBanner isOnline={isOnline} pendingCount={pending.length} />

      <div className="mx-auto flex w-full max-w-400">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col border-r border-neutral-200/70 bg-white/50 backdrop-blur-sm dark:border-neutral-800/70 dark:bg-neutral-900/50">
            <div className="px-3 pt-6 pb-2">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Navegación
              </p>
            </div>
            <nav className="flex flex-col gap-0.5 px-3">
              <NavLinks />
            </nav>
            <div className="mt-auto border-t border-neutral-200/70 p-3 dark:border-neutral-800/70">
              <LogoutButton />
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

      {mobileOpen && (
        <div className="fixed inset-0 z-1000 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in cursor-pointer"
            aria-label="Cerrar menú"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[80%] max-w-xs flex-col bg-white/95 shadow-2xl backdrop-blur-xl animate-slide-in-left dark:bg-neutral-900/95">
            <div className="flex h-16 items-center justify-between border-b border-neutral-200/70 px-4 dark:border-neutral-800/70">
              <Link href="/crm" className="block">
                <Logo />
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
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
              <NavLinks onClick={() => setMobileOpen(false)} />
            </nav>
            <div className="border-t border-neutral-200/70 p-3 dark:border-neutral-800/70">
              <LogoutButton mobile />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
