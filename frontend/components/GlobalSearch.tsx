"use client";

import SearchResults from "@/components/SearchResults";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { usePlatform } from "@/hooks/usePlatform";
import gsap from "gsap";
import { Loader2, Search, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export default function GlobalSearch() {
  const { modLabel } = usePlatform();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const originRectRef = useRef<DOMRect | null>(null);

  const {
    query,
    setQuery,
    results,
    loading,
    activeIndex,
    setActiveIndex,
    flatResults,
    hasResults,
    showUsuarios,
    navigate,
    clearResults,
    handleKeyDown,
  } = useGlobalSearch();

  const close = useCallback(() => setOpen(false), []);

  const openSearch = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    originRectRef.current = rect;
    setMounted(true);
    setOpen(true);
    setExpanded(false);
  }, []);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  // Open / close animation
  useLayoutEffect(() => {
    if (!mounted) return;
    const backdrop = backdropRef.current;
    const glow = glowRef.current;
    const aura = auraRef.current;
    const shell = shellRef.current;
    const panel = panelRef.current;
    const rect = originRectRef.current;
    if (!backdrop || !shell || !rect) return;

    gsap.killTweensOf([backdrop, glow, aura, shell, panel].filter(Boolean));

    if (open) {
      gsap.set(shell, {
        top: rect.top,
        left: rect.left,
        xPercent: 0,
        width: rect.width,
        height: rect.height,
        opacity: 1,
      });
      gsap.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18, ease: "power2.out" });
      if (glow) {
        gsap.fromTo(glow, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 0.6, scale: 1, duration: 0.9, delay: 0.1, ease: "power2.out" });
      }
      if (aura) {
        gsap.set(aura, { autoAlpha: 0, scale: 0.85 });
        gsap.to(aura, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.6,
          delay: 0.35,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(aura, { scale: 1.04, autoAlpha: 0.75, duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true });
          },
        });
      }
      gsap.to(shell, {
        delay: 0.05,
        top: "10vh",
        left: "50%",
        xPercent: -50,
        width: "min(36rem, calc(100vw - 2rem))",
        height: 56,
        duration: 0.45,
        ease: "power3.out",
        onComplete: () => {
          setExpanded(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        },
      });
    } else {
      setExpanded(false);
      const tl = gsap.timeline({
        onComplete: () => {
          setMounted(false);
          setQuery("");
          clearResults();
        },
      });
      if (panel) tl.to(panel, { autoAlpha: 0, y: -8, duration: 0.14, ease: "power2.in" }, 0);
      if (glow) tl.to(glow, { autoAlpha: 0, scale: 0.7, duration: 0.22, ease: "power2.in" }, 0);
      if (aura) tl.to(aura, { autoAlpha: 0, scale: 0.85, duration: 0.2, ease: "power2.in" }, 0);
      tl.to(shell, { top: rect.top, left: rect.left, xPercent: 0, width: rect.width, height: rect.height, duration: 0.24, ease: "power2.in" }, 0);
      tl.to(backdrop, { autoAlpha: 0, duration: 0.18, ease: "power2.in" }, 0);
    }
  }, [open, mounted, setQuery, clearResults]);

  // Panel entrance animation
  useEffect(() => {
    if (!mounted || !expanded || !query.trim()) return;
    const panel = panelRef.current;
    if (!panel) return;
    gsap.fromTo(panel, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power2.out" });
  }, [mounted, expanded, query]);

  // Focus input once expanded
  useEffect(() => {
    if (open && mounted && expanded) inputRef.current?.focus();
  }, [open, mounted, expanded]);

  // Global keyboard shortcut Ctrl/Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  const shellBase =
    "inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200/80 bg-white px-3 shadow-sm backdrop-blur dark:border-neutral-700/80 dark:bg-neutral-800";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openSearch}
        className={`${shellBase} group cursor-pointer transition-all hover:scale-105 hover:shadow-md active:scale-95 ${
          open ? "pointer-events-none opacity-0" : ""
        }`}
        aria-label="Búsqueda global"
      >
        <Search className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
        <span className="hidden text-[13px] text-neutral-400 dark:text-neutral-500 sm:block">
          Buscar...
        </span>
        <kbd className="hidden rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500 sm:block">
          {modLabel}
        </kbd>
      </button>

      {mounted && (
        <div className="fixed inset-0 z-1000" onClick={close} role="presentation">
          <button
            ref={backdropRef}
            type="button"
            className="absolute inset-0 bg-white/30 dark:bg-neutral-900/30 backdrop-blur-md opacity-0"
            aria-label="Cerrar búsqueda"
            onClick={close}
          />

          <div
            ref={glowRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[10vh] -translate-x-1/2 -translate-y-1/2 opacity-0"
            style={{
              width: "min(70rem, 110vw)",
              height: "min(40rem, 70vh)",
              background: "radial-gradient(ellipse at center, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0) 70%)",
              filter: "blur(70px)",
              zIndex: 0,
            }}
          />

          <div
            ref={auraRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 opacity-0"
            style={{
              top: "calc(10vh + 28px)",
              width: "min(44rem, calc(100vw - 1rem))",
              height: "180px",
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, rgba(186,210,255,0.35) 25%, rgba(186,210,255,0.12) 50%, rgba(186,210,255,0) 75%)",
              filter: "blur(28px)",
              zIndex: 5,
            }}
          />

          <div
            ref={shellRef}
            onClick={(e) => e.stopPropagation()}
            className={`${shellBase} absolute overflow-hidden`}
            style={{ zIndex: 10 }}
          >
            <div className="flex h-full w-full items-center gap-3 px-3">
              {loading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-neutral-400" />
              ) : (
                <Search className="h-4 w-4 shrink-0 text-neutral-400" />
              )}

              {expanded ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, close)}
                  placeholder="Buscar clientes, ventas, usuarios..."
                  className="flex-1 bg-transparent text-sm text-neutral-900 placeholder-neutral-400 outline-none dark:text-neutral-100 dark:placeholder-neutral-500"
                />
              ) : (
                <span className="flex-1 text-sm text-neutral-400 dark:text-neutral-500">
                  Buscar...
                </span>
              )}

              {query && expanded && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-md p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  aria-label="Limpiar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {expanded && (
                <kbd className="hidden rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-500 sm:inline-block">
                  Esc
                </kbd>
              )}

              {expanded && (
                <button
                  type="button"
                  onClick={close}
                  className="rounded-md px-2 py-1 text-[12px] font-medium text-blue-500 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-950/30 sm:hidden"
                  aria-label="Cerrar búsqueda"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {mounted && expanded && (
            <div
              ref={panelRef}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-1/2 top-[calc(10vh+4rem)] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 rounded-2xl border border-neutral-200/80 bg-white shadow-2xl dark:border-neutral-700/80 dark:bg-neutral-900 opacity-0"
              style={{ zIndex: 11 }}
            >
              <SearchResults
                query={query}
                results={results}
                flatResults={flatResults}
                activeIndex={activeIndex}
                hasResults={hasResults}
                loading={loading}
                showUsuarios={showUsuarios}
                onNavigate={(entry) => navigate(entry, close)}
                onHover={setActiveIndex}
              />

              {hasResults && (
                <div className="hidden border-t border-neutral-200/70 px-4 py-2 dark:border-neutral-700/70 sm:block">
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    ↑↓ navegar · Enter seleccionar · Esc cerrar
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
