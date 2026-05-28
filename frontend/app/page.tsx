"use client";

import { enviarFormulario } from "@/app/actions/form";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme, type Theme } from "@/hooks/useTheme";
import Image from "next/image";
import {
  ChangeEvent,
  ReactNode,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type FormState = { message: string; type: "success" | "error" } | null;

type PlanFilterId = "Solo Internet" | "TV CLÁSICA" | "TV FULL";

const DEFAULTS = {
  headline: "Tu hogar, conectado a la velocidad real",
  subhead:
    "Internet de fibra y televisión sin cortes. Hablá con un asesor y tenelo instalado en 24 hs.",
  showWaves: true,
  planFilter: "TV FULL" as PlanFilterId,
};

// ---------- Button helper ----------
const BTN_BASE =
  "inline-flex items-center justify-center gap-2.5 rounded-full font-semibold whitespace-nowrap border-0 cursor-pointer transition-[transform,background,color,box-shadow] duration-150";
const BTN_SIZES = {
  default: "px-[22px] py-[14px] text-[15px]",
  sm: "px-4 py-[9px] text-[13px]",
  lg: "px-7 py-[18px] text-base",
};
const BTN_VARIANTS = {
  primary:
    "bg-accent text-ink shadow-[0_1px_0_rgba(0,0,0,0.08),0_10px_30px_-10px_color-mix(in_oklab,var(--color-accent)_70%,transparent)] hover:-translate-y-0.5 hover:shadow-[0_1px_0_rgba(0,0,0,0.08),0_18px_40px_-12px_color-mix(in_oklab,var(--color-accent)_80%,transparent)]",
  outline:
    "bg-transparent text-ink shadow-[inset_0_0_0_1.5px_var(--color-ink)] hover:bg-ink hover:text-paper",
  ghost:
    "bg-transparent text-ink shadow-[inset_0_0_0_1.5px_var(--line-dark)] hover:shadow-[inset_0_0_0_1.5px_var(--color-ink)]",
};

// ---------- Equalizer / wave decoration ----------
function Equalizer({
  bars = 28,
  height = 80,
  className = "",
  seed = 1,
}: {
  bars?: number;
  height?: number;
  className?: string;
  seed?: number;
}) {
  const heights = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < bars; i++) {
      const v =
        (Math.sin((i + seed) * 1.7) + Math.cos((i + seed) * 0.9)) * 0.5 + 0.5;
      out.push((0.18 + Math.abs(v) * 0.82) * 100);
    }
    return out;
  }, [bars, seed]);
  return (
    <div className={`eq ${className}`} style={{ height }} aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          style={{
            height: `${h.toFixed(2)}%`,
            animationDelay: `${((i % 9) * 0.08).toFixed(2)}s`,
            animationDuration: `${(1.2 + (i % 5) * 0.18).toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  );
}

// ---------- Top nav ----------
function Nav({
  onCTA,
  theme,
  onThemeChange,
}: {
  onCTA: () => void;
  theme: Theme;
  onThemeChange: (next: Theme) => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const closeAnd = (fn?: () => void) => () => {
    setOpen(false);
    fn?.();
  };

  const navLinks = [
    { href: "#planes", label: "Planes" },
    { href: "#tv", label: "Televisión" },
    { href: "#porque", label: "Por qué nosotros" },
    { href: "#cobertura", label: "Cobertura" },
    { href: "#contacto", label: "Contacto" },
  ];

  return (
    <header className="nav fixed top-0 left-0 right-0 z-50 border-b border-[var(--line-dark)]">
      <div className="max-w-[var(--container-page)] mx-auto px-7 py-3.5 grid grid-cols-[auto_1fr_auto] items-center gap-6 max-[1280px]:flex max-[1280px]:justify-between max-[1280px]:gap-3 max-[700px]:px-[18px] max-[700px]:py-3">
        <a
          href="#top"
          className="logo inline-flex items-center gap-3 font-semibold"
          aria-label="FlowCRM"
        >
          <Image
            src="/images/logo/logo.svg"
            alt="FlowCRM Logo"
            width={2000}
            height={419}
            priority
            className="h-8 w-auto max-[700px]:h-6"
          />
        </a>
        <nav className="flex items-center justify-center gap-7 text-[14.5px] text-[rgba(11,15,14,0.7)] max-[1280px]:hidden">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3.5 max-[768px]:gap-2">
          <a
            href="tel:+5490000000000"
            className="nav-phone inline-flex items-center gap-2 font-mono text-[13px] text-ink whitespace-nowrap max-[768px]:hidden"
          >
            <span className="dot" />
            000 000-0000
          </a>
          <div className="max-[768px]:hidden">
            <ThemeToggle theme={theme} onChange={onThemeChange} />
          </div>
          <a
            href="/crm"
            className={`${BTN_BASE} ${BTN_SIZES.sm} ${BTN_VARIANTS.ghost} max-[768px]:hidden`}
            aria-label="Acceso para empleados"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 1116 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            CRM
          </a>
          <button
            className={`${BTN_BASE} ${BTN_SIZES.sm} ${BTN_VARIANTS.primary} max-[768px]:hidden`}
            onClick={onCTA}
          >
            Quiero contratar
          </button>
          <button
            type="button"
            className={`hidden items-center justify-center w-10 h-10 rounded-full bg-transparent border border-[var(--line-dark)] hover:border-ink transition-colors max-[1280px]:inline-flex ${open ? "is-open" : ""}`}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="hamburger" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`mobile-menu-overlay fixed inset-0 top-[var(--nav-h,60px)] z-40 hidden max-[1280px]:block ${open ? "is-open" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-[rgba(11,15,14,0.45)] transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />
        <aside
          id="mobile-menu"
          className={`mobile-menu absolute top-0 right-0 h-[calc(100dvh-var(--nav-h,60px))] w-[min(360px,86vw)] bg-paper border-l border-[var(--line-dark)] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.35)] flex flex-col overflow-y-auto overscroll-contain transition-transform duration-250 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          <nav className="flex flex-col px-6 pt-6 pb-2 gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-display text-[22px] tracking-[-0.02em] py-2.5 border-b border-[var(--line-dark)] text-ink hover:text-warm transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="px-6 mt-6 flex flex-col gap-3">
            <button
              className={`${BTN_BASE} ${BTN_SIZES.default} ${BTN_VARIANTS.primary} w-full`}
              onClick={closeAnd(onCTA)}
            >
              Quiero contratar
            </button>
            <a
              href="/crm"
              onClick={() => setOpen(false)}
              className={`${BTN_BASE} ${BTN_SIZES.default} ${BTN_VARIANTS.ghost} w-full`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 1116 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              CRM
            </a>
          </div>

          <div className="px-6 mt-auto pt-8 pb-7 flex items-center justify-between gap-3 border-t border-[var(--line-dark)] mt-8">
            <a
              href="tel:+5490000000000"
              onClick={() => setOpen(false)}
              className="nav-phone inline-flex items-center gap-2 font-mono text-[13px] text-ink"
            >
              <span className="dot" />
              000 000-0000
            </a>
            <ThemeToggle theme={theme} onChange={onThemeChange} />
          </div>
        </aside>
      </div>
    </header>
  );
}

// ---------- Hero ----------
function Hero({
  headline,
  subhead,
  showWaves,
  scrollToForm,
}: {
  headline: string;
  subhead: string;
  showWaves: boolean;
  scrollToForm: () => void;
}) {
  return (
    <section
      id="top"
      className="hero relative bg-ink text-paper overflow-hidden pt-[60px] px-7 max-[700px]:pt-10 max-[700px]:px-[22px]"
    >
      <div className="max-w-[var(--container-page)] mx-auto grid grid-cols-[1.15fr_0.85fr] gap-[60px] items-center pt-[70px] pb-[100px] relative max-[1024px]:grid-cols-1 max-[1024px]:gap-10 max-[1024px]:pt-[50px] max-[1024px]:pb-[150px]">
        <div className="max-w-[640px]">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-[7px] rounded-full font-mono text-xs tracking-[0.05em] bg-[#0b0f0e0a] dark:bg-white/5 border border-[#0b0f0e1a] dark:border-white/10 text-[#0B0F0E] dark:text-paper mb-7.5 lg:mb-5">
            <span className="pulse" /> Instalación en 24 hs · sin permanencia
          </div>
          <h1 className="display text-paper mt-[22px]">
            {headline.split(" ").map((w, i) => (
              <span key={i}>
                <span
                  className="word"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {w}
                </span>
                {i < headline.split(" ").length - 1 ? " " : ""}
              </span>
            ))}
          </h1>
          <p className="mt-[22px] text-[clamp(16px,1.45vw,18.5px)] leading-[1.55] text-[#0b0f0eb8] dark:text-[rgba(244,242,236,0.78)] max-w-[50ch]">
            {subhead}
          </p>
          <div className="flex gap-3.5 flex-wrap mt-8">
            <button
              className={`${BTN_BASE} ${BTN_SIZES.lg} ${BTN_VARIANTS.primary}`}
              onClick={scrollToForm}
            >
              Pedir asesoramiento
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <a
              href="#planes"
              className={`${BTN_BASE} ${BTN_SIZES.lg} bg-transparent text-paper shadow-[inset_0_0_0_1.5px_rgba(11,15,14,0.18)] dark:shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.2)] hover:shadow-[inset_0_0_0_1.5px_#0B0F0E] dark:hover:shadow-[inset_0_0_0_1.5px_var(--color-paper)] hover:bg-[#0b0f0e0a] dark:hover:bg-white/5`}
            >
              Ver planes
            </a>
          </div>
          <div className="flex gap-9 flex-wrap mt-11 pt-7 border-t border-[#0b0f0e1a] dark:border-white/10 max-[700px]:gap-5">
            <div className="flex flex-col">
              <strong className="font-display text-[28px] tracking-[-0.02em] max-[700px]:text-[22px]">
                +45.000
              </strong>
              <span className="text-[12.5px] text-[#0b0f0e8c] dark:text-[var(--text-dim)] font-mono tracking-[0.04em]">
                hogares conectados
              </span>
            </div>
            <div className="flex flex-col">
              <strong className="font-display text-[28px] tracking-[-0.02em] max-[700px]:text-[22px]">
                4.9 / 5
              </strong>
              <span className="text-[12.5px] text-[#0b0f0e8c] dark:text-[var(--text-dim)] font-mono tracking-[0.04em]">
                satisfacción del cliente
              </span>
            </div>
            <div className="flex flex-col">
              <strong className="font-display text-[28px] tracking-[-0.02em] max-[700px]:text-[22px]">
                24 / 7
              </strong>
              <span className="text-[12.5px] text-[#0b0f0e8c] dark:text-[var(--text-dim)] font-mono tracking-[0.04em]">
                soporte técnico real
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-[2]">
          <LeadForm compact />
        </div>
      </div>

      {showWaves && (
        <div
          className="absolute left-0 right-0 bottom-0 pointer-events-none opacity-[0.28] px-7 pb-2 max-w-[var(--container-page)] mx-auto"
          aria-hidden="true"
        >
          <Equalizer bars={48} height={160} seed={3} className="w-full" />
        </div>
      )}

      <div
        className="bg-accent text-ink border-y border-black/10 overflow-hidden relative"
        aria-hidden="true"
      >
        <div className="ticker-track">
          {Array.from({ length: 2 }).map((_, k) => (
            <div className="flex items-center gap-8 pr-8" key={k}>
              <span>Fibra óptica al hogar</span>
              <i className="not-italic opacity-60">✦</i>
              <span>Wi-Fi 6 incluido</span>
              <i className="not-italic opacity-60">✦</i>
              <span>Más de 120 canales HD</span>
              <i className="not-italic opacity-60">✦</i>
              <span>Sin permanencia mínima</span>
              <i className="not-italic opacity-60">✦</i>
              <span>Instalación gratis</span>
              <i className="not-italic opacity-60">✦</i>
              <span>Soporte 24/7</span>
              <i className="not-italic opacity-60">✦</i>
              <span>Cobertura nacional</span>
              <i className="not-italic opacity-60">✦</i>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Plan data ----------
type Plan = {
  speed: string;
  tv: "CLÁSICA" | "FULL" | null;
  price: number;
};

const PLAN_DATA: Plan[] = [
  { speed: "300MB", tv: null, price: 24300 },
  { speed: "300MB", tv: "CLÁSICA", price: 36200 },
  { speed: "300MB", tv: "FULL", price: 39900 },
  { speed: "600MB", tv: null, price: 27560 },
  { speed: "600MB", tv: "CLÁSICA", price: 39460 },
  { speed: "600MB", tv: "FULL", price: 43160 },
  { speed: "1 GIGA", tv: null, price: 33480 },
  { speed: "1 GIGA", tv: "CLÁSICA", price: 45380 },
  { speed: "1 GIGA", tv: "FULL", price: 49080 },
];

const PLAN_FEATURES = {
  base: [
    "Wi-Fi 6 de última generación",
    "Instalación profesional gratuita",
    "Soporte técnico 24/7",
    "Sin costo de alta",
  ],
  classic: [
    "+80 canales en alta definición",
    "Decodificador HD incluido",
    "Guía de programación interactiva",
    "Canales infantiles y deportes básicos",
  ],
  full: [
    "+150 canales HD y 4K",
    "Premium: deportes, cine y series",
    "App para ver en cualquier dispositivo",
    "Grabación en la nube incluida",
  ],
};

function Plans({
  defaultFilter,
  onSelectPlan,
}: {
  defaultFilter: PlanFilterId;
  onSelectPlan: (label: string) => void;
}) {
  const [filter, setFilter] = useState<PlanFilterId>(defaultFilter);
  useEffect(() => setFilter(defaultFilter), [defaultFilter]);

  const filters: { id: PlanFilterId; label: string; sub: string }[] = [
    { id: "Solo Internet", label: "Solo Internet", sub: "Velocidad pura" },
    { id: "TV CLÁSICA", label: "Internet + TV Clásica", sub: "Lo esencial" },
    { id: "TV FULL", label: "Internet + TV Full", sub: "Todo incluido" },
  ];

  const visible = PLAN_DATA.filter((p) => {
    if (filter === "Solo Internet") return p.tv === null;
    if (filter === "TV CLÁSICA") return p.tv === "CLÁSICA";
    if (filter === "TV FULL") return p.tv === "FULL";
    return true;
  });

  const featuresFor = (p: Plan) => {
    const tv =
      p.tv === "FULL"
        ? PLAN_FEATURES.full
        : p.tv === "CLÁSICA"
          ? PLAN_FEATURES.classic
          : [];
    return [...PLAN_FEATURES.base, ...tv];
  };

  const planLabel = (p: Plan) => (p.tv ? `${p.speed} TV ${p.tv}` : p.speed);

  return (
    <section
      id="planes"
      className="max-w-[var(--container-page)] mx-auto px-7 pt-[120px] pb-[110px] max-[700px]:px-[22px] max-[700px]:py-20"
    >
      <div className="max-w-[760px]">
        <div className="inline-flex items-center gap-2.5 font-mono text-xs tracking-[0.18em] uppercase text-ink">
          <span className="inline-block w-7 h-0.5 bg-accent" />
          NUESTROS PLANES
        </div>
        <h2 className="display-2">
          Elegí cómo querés <em>conectarte</em>
        </h2>
        <p className="section-lede text-[rgba(11,15,14,0.72)] max-w-[56ch] mt-[18px]">
          Nueve combinaciones de internet y televisión pensadas para cada hogar.
          Hablá con un asesor y armamos el plan perfecto para vos.
        </p>
      </div>

      <div
        className="grid grid-cols-3 gap-2.5 bg-paper-2 border border-[var(--line-dark)] rounded-full p-1.5 max-w-[720px] mx-auto mt-11 mb-14 max-[700px]:grid-cols-1 max-[700px]:rounded-[22px]"
        role="tablist"
      >
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`flex flex-col items-center gap-0.5 px-4 py-3 rounded-full transition-[background,color,transform] duration-200 border-0 cursor-pointer ${
                active ? "bg-ink text-paper" : "bg-transparent text-ink"
              }`}
              onClick={() => setFilter(f.id)}
            >
              <span className="font-semibold text-[14.5px] tracking-[-0.01em]">
                {f.label}
              </span>
              <span
                className={`text-[11.5px] font-mono tracking-[0.06em] uppercase ${
                  active
                    ? "text-[rgba(244,242,236,0.6)]"
                    : "text-[rgba(11,15,14,0.55)]"
                }`}
              >
                {f.sub}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-[22px] max-[1024px]:grid-cols-2 max-[700px]:grid-cols-1">
        {visible.map((p, idx) => {
          const featured = idx === 1 && visible.length === 3;
          return (
            <article
              key={planLabel(p)}
              className={`plan-card relative bg-white border border-[var(--line-dark)] rounded-[var(--radius-card-lg)] px-7 py-[30px] flex flex-col transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-ink hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.18)] ${featured ? "featured" : ""}`}
            >
              {featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-ink px-3.5 py-[5px] rounded-full font-mono text-[11.5px] tracking-[0.12em] uppercase font-semibold">
                  Más elegido
                </div>
              )}
              <div className="flex items-start justify-between gap-3.5 mb-5">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-[56px] leading-[0.9] tracking-[-0.04em] font-semibold">
                    {p.speed.replace("MB", "").replace("1 GIGA", "1G")}
                  </span>
                  <span className="plan-speed-unit font-mono text-[13px] tracking-[0.1em] text-[rgba(11,15,14,0.6)]">
                    {p.speed.includes("GIGA") ? "GIGA" : "MB"}
                  </span>
                </div>
                <Equalizer
                  bars={14}
                  height={36}
                  seed={idx + 4}
                  className="mini w-[90px]"
                />
              </div>
              <div className="text-[15px] leading-[1.3] mb-4">
                {p.tv ? (
                  <>
                    Internet{" "}
                    <strong className="font-semibold">{p.speed}</strong> + TV{" "}
                    <strong className="font-semibold">{p.tv}</strong>
                  </>
                ) : (
                  <>
                    Internet{" "}
                    <strong className="font-semibold">{p.speed}</strong>
                  </>
                )}
              </div>
              <div className="plan-price flex items-baseline gap-1 pb-[18px] border-b border-dashed border-[var(--line-dark)]">
                <span className="font-display text-[22px]">$</span>
                <span className="font-display text-[46px] tracking-[-0.03em] font-semibold">
                  {p.price.toLocaleString("es-AR")}
                </span>
                <span className="price-unit font-mono text-xs text-[rgba(11,15,14,0.6)] ml-1.5">
                  / mes
                </span>
              </div>
              <p className="plan-promo my-3.5 mb-4 text-[13px] font-mono text-warm tracking-[0.01em]">
                Bonificación primer mes · sin costo de instalación
              </p>
              <ul className="list-none p-0 mb-6 flex flex-col gap-[9px] text-[14.5px] flex-1">
                {featuresFor(p).map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="flex-none mt-1 text-ink bg-accent rounded-full p-0.5"
                    >
                      <path
                        d="M5 12.5l5 5L20 7"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`${BTN_BASE} ${BTN_SIZES.default} w-full ${featured ? BTN_VARIANTS.primary : "btn-outline bg-transparent text-ink shadow-[inset_0_0_0_1.5px_var(--color-ink)] hover:bg-ink hover:text-paper"}`}
                onClick={() => onSelectPlan(planLabel(p))}
              >
                Lo quiero
              </button>
            </article>
          );
        })}
      </div>

      <p className="mt-7 text-center font-mono text-xs text-[rgba(11,15,14,0.55)] tracking-[0.02em]">
        Los valores son orientativos y están sujetos a cobertura y zona. Un
        asesor confirma el precio final al contactarte.
      </p>
    </section>
  );
}

// ---------- Why us ----------
function WhyUs() {
  const items = [
    {
      k: "01",
      t: "Fibra real al hogar",
      d: "Velocidad simétrica de subida y bajada, sin cuellos de botella en horario pico.",
    },
    {
      k: "02",
      t: "Atención humana",
      d: "Asesores comerciales y soporte que te atienden por teléfono, WhatsApp o en tu casa.",
    },
    {
      k: "03",
      t: "Sin letra chica",
      d: "Sin permanencia, sin costos ocultos. Si no te convence, lo das de baja cuando quieras.",
    },
    {
      k: "04",
      t: "Tele que funciona",
      d: "Decodificador HD, app móvil y los canales que mirás todos los días, en una sola factura.",
    },
  ];
  return (
    <section
      id="porque"
      className="bg-paper px-7 py-[110px] max-[700px]:px-[22px] max-[700px]:py-20"
    >
      <div className="grid grid-cols-[0.95fr_1.05fr] gap-20 items-start max-w-[var(--container-page)] mx-auto max-[1024px]:grid-cols-1 max-[1024px]:gap-10">
        <div>
          <div className="inline-flex items-center gap-2.5 font-mono text-xs tracking-[0.18em] uppercase text-ink">
            <span className="inline-block w-7 h-0.5 bg-accent" />
            POR QUÉ NOSOTROS
          </div>
          <h2 className="display-2">
            Hacemos <em>ruido</em>
            <br />
            del bueno.
          </h2>
          <p className="section-lede text-[rgba(11,15,14,0.72)] max-w-[56ch] mt-[18px]">
            Trabajamos para que tu casa esté siempre conectada, con un equipo
            comercial que entiende lo que necesitás antes de que tengas que
            explicarlo.
          </p>
          <Equalizer
            bars={22}
            height={70}
            seed={9}
            className="why-eq w-full mt-8 opacity-65"
          />
        </div>
        <div className="grid grid-cols-2 gap-5 max-[700px]:grid-cols-1">
          {items.map((it) => (
            <div
              className="px-6 py-7 bg-white border border-[var(--line-dark)] rounded-[var(--radius-card)] transition-[transform,border-color] duration-200 hover:-translate-y-[3px] hover:border-ink"
              key={it.k}
            >
              <span className="font-mono text-[13px] tracking-[0.1em] text-warm block mb-3.5">
                {it.k}
              </span>
              <h3 className="font-display text-[22px] tracking-[-0.02em] m-0 mb-2 font-semibold">
                {it.t}
              </h3>
              <p className="text-[14.5px] leading-[1.5] text-[rgba(11,15,14,0.7)] m-0">
                {it.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- TV showcase ----------
function TVShowcase() {
  const channels = [
    "Deportes en vivo",
    "Películas estreno",
    "Series originales",
    "Infantiles",
    "Noticias 24h",
    "Documentales",
    "Música",
    "Lifestyle",
    "Internacionales",
  ];
  return (
    <section id="tv" className="bg-ink text-paper">
      <div className="max-w-[var(--container-page)] mx-auto px-7 py-[110px] grid grid-cols-[0.95fr_1.05fr] gap-[70px] items-center max-[1024px]:grid-cols-1 max-[1024px]:gap-10 max-[700px]:px-[22px] max-[700px]:py-20">
        <div>
          <div className="inline-flex items-center gap-2.5 font-mono text-xs tracking-[0.18em] uppercase text-paper">
            <span className="inline-block w-7 h-0.5 bg-accent" />
            TELEVISIÓN
          </div>
          <h2 className="display-2 text-paper">
            Más de <em>150 canales</em> y miles de motivos para no cambiar.
          </h2>
          <p className="section-lede text-[rgba(244,242,236,0.78)] max-w-[56ch] mt-[18px]">
            Sumá televisión a tu plan de internet y mirá lo que querés, cuando
            querés, desde el televisor o el celular. Una sola factura, cero
            complicaciones.
          </p>
          <ul className="tv-bullets list-none p-0 mt-7 mb-9 flex flex-col gap-2.5">
            <li className="text-[15px] text-[rgba(244,242,236,0.85)]">
              Aplicación móvil incluida — Android, iOS y Smart TV
            </li>
            <li className="text-[15px] text-[rgba(244,242,236,0.85)]">
              Grabación en la nube hasta 200 hs
            </li>
            <li className="text-[15px] text-[rgba(244,242,236,0.85)]">
              Pausá y rebobiná la TV en vivo
            </li>
          </ul>
          <a
            href="#contacto"
            className={`${BTN_BASE} ${BTN_SIZES.lg} ${BTN_VARIANTS.primary} text-[#0B0F0E]!`}
          >
            Sumar TV a mi plan
          </a>
        </div>
        <div className="grid grid-cols-3 gap-3 max-[1024px]:grid-cols-2 max-[700px]:grid-cols-2">
          {channels.map((c, i) => (
            <div
              className="tv-tile aspect-square border border-white/10 rounded-[var(--radius-card)] p-[18px] flex flex-col justify-between relative overflow-hidden"
              key={c}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <span className="font-mono text-[11.5px] tracking-[0.12em] text-accent">
                CH·{(i + 1).toString().padStart(2, "0")}
              </span>
              <span className="font-display text-[clamp(18px,1.6vw,24px)] tracking-[-0.02em] font-semibold z-[1]">
                {c}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Process ----------
function Process() {
  const steps = [
    {
      n: 1,
      t: "Dejá tus datos",
      d: "Completá el formulario o llamanos. Toma menos de un minuto.",
    },
    {
      n: 2,
      t: "Te llamamos hoy",
      d: "Un asesor te contacta el mismo día para confirmar cobertura y plan.",
    },
    {
      n: 3,
      t: "Coordinamos la visita",
      d: "Elegís día y horario. Vamos a tu casa cuando vos puedas.",
    },
    {
      n: 4,
      t: "Conectado en 24 hs",
      d: "Instalamos, te entregamos el equipo y empezás a navegar al toque.",
    },
  ];
  return (
    <section className="max-w-[var(--container-page)] mx-auto px-7 py-[120px] max-[700px]:px-[22px] max-[700px]:py-20">
      <div className="max-w-[760px] mx-auto text-center">
        <div className="inline-flex items-center gap-2.5 font-mono text-xs tracking-[0.18em] uppercase text-ink">
          <span className="inline-block w-7 h-0.5 bg-accent" />
          ASÍ ES DE FÁCIL
        </div>
        <h2 className="display-2">
          De la consulta a la conexión, en <em>4 pasos</em>.
        </h2>
      </div>
      <ol className="steps list-none p-0 grid grid-cols-4 mt-16 max-[1024px]:grid-cols-2 max-[1024px]:gap-y-[30px] max-[700px]:grid-cols-1">
        {steps.map((s, i) => (
          <li
            key={s.n}
            className={`step relative pr-6 max-[1024px]:pr-0 ${i > 0 ? "pl-6 max-[1024px]:pl-0 max-[1024px]:[&:nth-child(even)]:pl-6 max-[700px]:[&:nth-child(even)]:pl-0 max-[700px]:pt-[30px]" : ""} ${i === 0 ? "max-[1024px]:pr-4" : ""}`}
          >
            <div className="mb-4">
              <span className="relative inline-block isolate font-display text-4xl font-semibold tracking-[-0.04em] text-ink">
                {s.n.toString().padStart(2, "0")}
                <span
                  aria-hidden="true"
                  className="absolute bottom-1.5 left-0 right-0 h-2 bg-accent rounded-sm -z-10"
                />
              </span>
            </div>
            <h4 className="font-display text-xl font-semibold tracking-[-0.02em] m-0 mb-1.5">
              {s.t}
            </h4>
            <p className="text-[14.5px] leading-[1.5] text-[rgba(11,15,14,0.65)] m-0">
              {s.d}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

// ---------- Coverage ----------
function Coverage() {
  const cities = [
    "Buenos Aires",
    "Rosario",
    "Córdoba",
    "Mendoza",
    "La Plata",
    "Mar del Plata",
    "Tucumán",
    "Salta",
    "Neuquén",
    "Bahía Blanca",
    "Santa Fe",
    "San Juan",
  ];
  return (
    <section id="cobertura" className="bg-paper-2">
      <div className="max-w-[var(--container-page)] mx-auto px-7 py-[110px] grid grid-cols-[0.85fr_1.15fr] gap-[60px] items-center max-[1024px]:grid-cols-1 max-[1024px]:gap-10 max-[700px]:px-[22px] max-[700px]:py-20">
        <div>
          <div className="inline-flex items-center gap-2.5 font-mono text-xs tracking-[0.18em] uppercase text-ink">
            <span className="inline-block w-7 h-0.5 bg-accent" />
            COBERTURA
          </div>
          <h2 className="display-2">
            Estamos donde <em>vos estás</em>.
          </h2>
          <p className="section-lede text-[rgba(11,15,14,0.72)] max-w-[56ch] mt-[18px]">
            Operamos en más de 60 localidades del país y seguimos creciendo. Si
            no ves tu ciudad, escribinos: probablemente ya estemos cerca.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-px bg-[var(--line-dark)] border border-[var(--line-dark)] rounded-[var(--radius-card)] overflow-hidden max-[700px]:grid-cols-2">
          {cities.map((c) => (
            <div
              className="bg-paper-2 p-[18px] flex items-center gap-2.5 text-[15px] transition-colors duration-200 hover:bg-white"
              key={c}
            >
              <span className="city-dot" />
              {c}
            </div>
          ))}
          <div className="bg-ink text-paper p-[18px] flex items-center gap-2.5 font-mono text-[13px] tracking-[0.06em]">
            + 48 más
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Testimonials ----------
function Testimonials() {
  const items = [
    {
      q: "Cambié de proveedor por velocidad y me llevé también la atención. Me llamaron a la hora de cargar el formulario.",
      n: "Florencia M.",
      r: "Cliente desde 2024 · Rosario",
    },
    {
      q: "El asesor me explicó todo sin vueltas y el técnico vino al otro día. Funciona impecable, hasta cuando jugamos toda la familia.",
      n: "Diego R.",
      r: "Cliente desde 2023 · Mendoza",
    },
    {
      q: "El combo internet + TV me ahorra una factura y los chicos miran sus dibujitos en la app cuando viajamos. Recomendado.",
      n: "Carolina P.",
      r: "Cliente desde 2025 · CABA",
    },
  ];
  return (
    <section className="max-w-[var(--container-page)] mx-auto px-7 py-[110px] max-[700px]:px-[22px] max-[700px]:py-20">
      <div className="max-w-[760px] mb-14">
        <div className="inline-flex items-center gap-2.5 font-mono text-xs tracking-[0.18em] uppercase text-ink">
          <span className="inline-block w-7 h-0.5 bg-accent" />
          LO QUE DICEN NUESTROS CLIENTES
        </div>
        <h2 className="display-2">
          4.9 <em>de calificación</em>
          <br />
          en miles de hogares.
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-[22px] max-[1024px]:grid-cols-2 max-[700px]:grid-cols-1">
        {items.map((t, i) => (
          <figure
            key={i}
            className="bg-white border border-[var(--line-dark)] rounded-[var(--radius-card)] p-7 m-0 flex flex-col gap-4 transition-[transform,border-color] duration-200 hover:-translate-y-[3px] hover:border-ink"
          >
            <div className="text-warm flex gap-0.5" aria-label="5 estrellas">
              {Array.from({ length: 5 }).map((_, k) => (
                <svg
                  key={k}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l2.9 6.9 7.4.6-5.6 4.9 1.7 7.3L12 17.8 5.6 21.7l1.7-7.3L1.7 9.5l7.4-.6L12 2z" />
                </svg>
              ))}
            </div>
            <blockquote className="font-display text-[19px] leading-[1.4] tracking-[-0.015em] m-0 font-medium text-pretty">
              {`“${t.q}”`}
            </blockquote>
            <figcaption className="flex flex-col gap-0.5 mt-auto">
              <strong className="font-semibold text-[14.5px]">{t.n}</strong>
              <span className="font-mono text-xs text-[rgba(11,15,14,0.55)] tracking-[0.04em]">
                {t.r}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// ---------- FAQ ----------
function FAQ() {
  const items = [
    {
      q: "¿Cuánto tarda la instalación?",
      a: "Coordinamos la visita el mismo día que dejás tus datos y, en general, instalamos dentro de las 24 a 48 hs hábiles. El técnico te avisa antes de llegar.",
    },
    {
      q: "¿Tiene permanencia mínima?",
      a: "No. Podés dar de baja cuando quieras, sin penalidad. Si te mudás, mantenemos tu plan en la nueva dirección si está dentro de la cobertura.",
    },
    {
      q: "¿Qué necesito para contratar?",
      a: "Solo tu DNI, una dirección dentro de cobertura y elegir cómo vas a pagar. El asesor te guía en cada paso.",
    },
    {
      q: "¿Puedo cambiar de plan más adelante?",
      a: "Sí. Subís o bajás de plan cuando quieras desde tu cuenta o llamando al 0800. Los cambios se aplican en la factura siguiente.",
    },
    {
      q: "¿La televisión se ve también en el celular?",
      a: "Sí, los planes con TV incluyen la app para ver en vivo y pausar contenidos en tu celular, tablet o Smart TV, sin costo adicional.",
    },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="max-w-[var(--container-page)] mx-auto px-7 pt-[110px] pb-[120px] max-[700px]:px-[22px] max-[700px]:py-20">
      <div className="max-w-[760px]">
        <div className="inline-flex items-center gap-2.5 font-mono text-xs tracking-[0.18em] uppercase text-ink">
          <span className="inline-block w-7 h-0.5 bg-accent" />
          PREGUNTAS FRECUENTES
        </div>
        <h2 className="display-2">
          Lo que <em>siempre</em> nos preguntan.
        </h2>
      </div>
      <ul className="list-none p-0 mt-14 max-w-[880px]">
        {items.map((it, i) => (
          <li
            key={i}
            className={`faq-item border-t border-[var(--line-dark)] [&:last-child]:border-b ${open === i ? "open" : ""}`}
          >
            <button
              type="button"
              className="w-full flex items-center justify-between gap-6 px-1 py-[22px] text-left font-display text-[clamp(18px,1.7vw,22px)] tracking-[-0.02em] font-medium text-ink transition-colors duration-200 bg-transparent border-0 cursor-pointer hover:text-warm"
              onClick={() => setOpen(open === i ? -1 : i)}
              aria-expanded={open === i}
            >
              <span>{it.q}</span>
              <span className="faq-toggle" aria-hidden="true">
                <i></i>
                <i></i>
              </span>
            </button>
            <div className="faq-a">
              <p className="m-0 text-[15.5px] leading-[1.55] text-[rgba(11,15,14,0.7)] max-w-[70ch]">
                {it.a}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- Lead form ----------
type LeadData = {
  nombreCompleto: string;
  telefono: string;
  servicio: string;
};

function LeadForm({
  compact = false,
  prefilledPlan = "",
}: {
  compact?: boolean;
  prefilledPlan?: string;
}) {
  const [data, setData] = useState<LeadData>({
    nombreCompleto: "",
    telefono: "",
    servicio: prefilledPlan || "1 GIGA TV FULL",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    enviarFormulario,
    null,
  );

  useEffect(() => {
    if (prefilledPlan) setData((d) => ({ ...d, servicio: prefilledPlan }));
  }, [prefilledPlan]);

  const onChange =
    (k: keyof LeadData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setData((d) => ({ ...d, [k]: e.target.value }));
    };

  const valid = {
    nombreCompleto: data.nombreCompleto.trim().length >= 2,
    telefono: /^[0-9+\s\-()]{6,}$/.test(data.telefono.trim()),
  };
  const isValid = Object.values(valid).every(Boolean);

  const cardBase = `bg-white text-ink rounded-[var(--radius-card-lg)] border border-[var(--line-dark)] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.4)] flex flex-col gap-[18px] ${compact ? "p-7" : "p-8"}`;

  if (state?.type === "success") {
    return (
      <div className={`${cardBase} text-center items-center !gap-3.5`}>
        <div className="check-anim w-[72px] h-[72px]" aria-hidden="true">
          <svg viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="24" />
            <path d="M14 27l8 8 16-18" />
          </svg>
        </div>
        <h3 className="font-display text-[clamp(22px,2.2vw,28px)] tracking-[-0.02em] m-0 font-semibold text-balance mt-2">
          ¡Listo, {data.nombreCompleto.split(" ")[0]}!
        </h3>
        <p className="text-[15px] text-[rgba(11,15,14,0.7)] m-0">
          Recibimos tu solicitud para el plan <strong>{data.servicio}</strong>.
          Un asesor te contacta al <strong>{data.telefono}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form
      className={cardBase}
      action={formAction}
      onSubmit={(e) => {
        setTouched({ nombreCompleto: true, telefono: true });
        if (!isValid) e.preventDefault();
      }}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <div className="inline-flex items-center gap-2 font-mono text-[11.5px] tracking-[0.06em] uppercase text-[rgba(11,15,14,0.6)]">
          <span className="pulse" /> Te llamamos en menos de 1 hora
        </div>
        <h3 className="font-display text-[clamp(22px,2.2vw,28px)] tracking-[-0.02em] m-0 font-semibold text-balance">
          Pedí asesoramiento personalizado
        </h3>
        {!compact && (
          <p className="m-0 text-[14.5px] text-[rgba(11,15,14,0.65)]">
            Dejá tus datos y un asesor te arma el plan ideal para tu hogar.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3.5">
        <Field
          label="Nombre y apellido"
          name="nombreCompleto"
          value={data.nombreCompleto}
          onChange={onChange("nombreCompleto")}
          onBlur={() => setTouched((t) => ({ ...t, nombreCompleto: true }))}
          error={
            touched.nombreCompleto && !valid.nombreCompleto
              ? "Contanos cómo te llamás"
              : ""
          }
          placeholder="Ej. Lucía Fernández"
        />
      </div>
      <div className="flex flex-col gap-3.5">
        <Field
          label="Teléfono"
          name="telefono"
          value={data.telefono}
          onChange={onChange("telefono")}
          onBlur={() => setTouched((t) => ({ ...t, telefono: true }))}
          error={
            touched.telefono && !valid.telefono
              ? "Ingresá un teléfono válido"
              : ""
          }
          placeholder="11 5555 5555"
          inputMode="tel"
        />
      </div>
      <div className="flex flex-col gap-3.5">
        <label className="field flex flex-col gap-1.5">
          <span className="text-[12.5px] font-mono tracking-[0.06em] uppercase text-[rgba(11,15,14,0.6)]">
            Plan de interés
          </span>
          <select
            className="input"
            name="servicio"
            value={data.servicio}
            onChange={onChange("servicio")}
          >
            <option>300MB</option>
            <option>300MB TV CLÁSICA</option>
            <option>300MB TV FULL</option>
            <option>600MB</option>
            <option>600MB TV CLÁSICA</option>
            <option>600MB TV FULL</option>
            <option>1 GIGA</option>
            <option>1 GIGA TV CLÁSICA</option>
            <option>1 GIGA TV FULL</option>
            <option>No estoy seguro, asesoradme</option>
          </select>
        </label>
      </div>
      {state?.type === "error" && (
        <p className="text-xs text-[#e5483d] font-mono" aria-live="polite">
          {state.message}
        </p>
      )}
      <button
        className={`${BTN_BASE} ${BTN_SIZES.lg} ${BTN_VARIANTS.primary} w-full`}
        type="submit"
        disabled={pending}
      >
        {pending ? "Enviando..." : "Quiero que me llamen"}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12h14M13 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <p className="m-0 text-center font-mono text-[11.5px] text-[rgba(11,15,14,0.55)] tracking-[0.04em]">
        Sin compromiso · Tus datos están protegidos · Atención de Lun a Sáb
      </p>
    </form>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

function Field({ label, error, ...rest }: FieldProps) {
  return (
    <label
      className={`field flex flex-col gap-1.5 ${error ? "has-error" : ""}`}
    >
      <span className="text-[12.5px] font-mono tracking-[0.06em] uppercase text-[rgba(11,15,14,0.6)]">
        {label}
      </span>
      <input className="input" {...rest} />
      {error && (
        <span className="text-xs text-[#e5483d] font-mono">{error}</span>
      )}
    </label>
  );
}

// ---------- Final CTA ----------
function FinalCTA({
  formRef,
  prefilledPlan,
}: {
  formRef: React.RefObject<HTMLElement | null>;
  prefilledPlan: string;
}) {
  return (
    <section
      id="contacto"
      className="final bg-ink text-paper relative overflow-hidden"
      ref={formRef}
    >
      <div className="relative max-w-[var(--container-page)] mx-auto px-7 py-[110px] grid grid-cols-2 gap-[60px] items-center max-[1024px]:grid-cols-1 max-[1024px]:gap-10 max-[700px]:px-[22px] max-[700px]:py-20">
        <div>
          <div className="inline-flex items-center gap-2.5 font-mono text-xs tracking-[0.18em] uppercase text-paper">
            <span className="inline-block w-7 h-0.5 bg-accent" />
            CONTACTANOS
          </div>
          <h2 className="display-2 dark text-paper">
            Hagamos <em>ruido juntos</em>.<br />
            Tu mejor plan está a una llamada.
          </h2>
          <p className="section-lede text-[#0b0f0eb8] dark:text-[rgba(244,242,236,0.78)] max-w-[56ch] mt-[18px]">
            Dejanos tus datos o llamanos al <strong>000 000-0000</strong>. Te
            asesoramos sin compromiso y armamos un plan a la medida de tu casa.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <a
              className="channel flex items-center gap-4 px-[18px] py-4 border border-[#0b0f0e1a] dark:border-white/10 rounded-[var(--radius-card)] bg-[#ffffffb3] dark:bg-white/5 transition-[background,border-color,transform] duration-200 hover:bg-white dark:hover:bg-white/10 hover:border-[#0B0F0E] dark:hover:border-accent hover:translate-x-0.5"
              href="tel:+5490000000000"
            >
              <span className="w-10 h-10 inline-flex items-center justify-center bg-accent text-ink rounded-xl text-lg font-bold flex-none">
                ☎
              </span>
              <span className="flex flex-col">
                <b className="text-[15px] font-semibold text-[#0B0F0E] dark:text-paper">
                  000 000-0000
                </b>
                <i className="not-italic font-mono text-[11.5px] text-[#0b0f0e8c] dark:text-[rgba(244,242,236,0.55)] tracking-[0.04em]">
                  Llamada gratuita
                </i>
              </span>
            </a>
            <a
              className="channel flex items-center gap-4 px-[18px] py-4 border border-[#0b0f0e1a] dark:border-white/10 rounded-[var(--radius-card)] bg-[#ffffffb3] dark:bg-white/5 transition-[background,border-color,transform] duration-200 hover:bg-white dark:hover:bg-white/10 hover:border-[#0B0F0E] dark:hover:border-accent hover:translate-x-0.5"
              href="https://wa.me/+5490000000000"
            >
              <span className="w-10 h-10 inline-flex items-center justify-center bg-accent text-ink rounded-xl text-lg font-bold flex-none">
                ✦
              </span>
              <span className="flex flex-col">
                <b className="text-[15px] font-semibold text-[#0B0F0E] dark:text-paper">
                  WhatsApp
                </b>
                <i className="not-italic font-mono text-[11.5px] text-[#0b0f0e8c] dark:text-[rgba(244,242,236,0.55)] tracking-[0.04em]">
                  Lun a Sáb · 9 a 21 hs
                </i>
              </span>
            </a>
            <a
              className="channel flex items-center gap-4 px-[18px] py-4 border border-[#0b0f0e1a] dark:border-white/10 rounded-[var(--radius-card)] bg-[#ffffffb3] dark:bg-white/5 transition-[background,border-color,transform] duration-200 hover:bg-white dark:hover:bg-white/10 hover:border-[#0B0F0E] dark:hover:border-accent hover:translate-x-0.5"
              href="mailto:contacto@example.com"
            >
              <span className="w-10 h-10 inline-flex items-center justify-center bg-accent text-ink rounded-xl text-lg font-bold flex-none">
                @
              </span>
              <span className="flex flex-col">
                <b className="text-[15px] font-semibold text-[#0B0F0E] dark:text-paper">
                  contacto@example.com
                </b>
                <i className="not-italic font-mono text-[11.5px] text-[#0b0f0e8c] dark:text-[rgba(244,242,236,0.55)] tracking-[0.04em]">
                  Respondemos en el día
                </i>
              </span>
            </a>
          </div>
          <Equalizer
            bars={32}
            height={80}
            seed={11}
            className="final-eq w-full mt-9 opacity-55"
          />
        </div>
        <div>
          <LeadForm prefilledPlan={prefilledPlan} />
        </div>
      </div>
    </section>
  );
}

// ---------- Footer ----------
function Footer() {
  return (
    <footer className="bg-ink text-paper px-7 pt-20 pb-10 border-t border-white/10">
      <div className="max-w-[var(--container-page)] mx-auto grid grid-cols-[1.2fr_2fr] gap-[60px] max-[1024px]:grid-cols-1 max-[1024px]:gap-10">
        <div>
          <a
            href="#top"
            className="logo inline-flex items-center gap-3 font-semibold"
          >
            <Image
              src="/images/logo/logo.svg"
              alt="FlowCRM Logo"
              width={2000}
              height={419}
              priority
              className="h-8 w-auto"
            />
          </a>
          <p className="mt-[18px] text-sm text-[rgba(244,242,236,0.6)] max-w-[36ch]">
            Internet de fibra y televisión para hogares que no se conforman con
            poco.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-[30px] max-[700px]:grid-cols-1">
          <div>
            <h5 className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-[rgba(244,242,236,0.55)] m-0 mb-3.5 font-medium">
              Planes
            </h5>
            <a
              href="#planes"
              className="block text-sm text-[rgba(244,242,236,0.85)] py-1 transition-colors duration-200 hover:text-accent"
            >
              Solo Internet
            </a>
            <a
              href="#planes"
              className="block text-sm text-[rgba(244,242,236,0.85)] py-1 transition-colors duration-200 hover:text-accent"
            >
              Internet + TV Clásica
            </a>
            <a
              href="#planes"
              className="block text-sm text-[rgba(244,242,236,0.85)] py-1 transition-colors duration-200 hover:text-accent"
            >
              Internet + TV Full
            </a>
          </div>
          <div>
            <h5 className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-[rgba(244,242,236,0.55)] m-0 mb-3.5 font-medium">
              Empresa
            </h5>
            <a
              href="#porque"
              className="block text-sm text-[rgba(244,242,236,0.85)] py-1 transition-colors duration-200 hover:text-accent"
            >
              Por qué nosotros
            </a>
            <a
              href="#cobertura"
              className="block text-sm text-[rgba(244,242,236,0.85)] py-1 transition-colors duration-200 hover:text-accent"
            >
              Cobertura
            </a>
            <a
              href="#contacto"
              className="block text-sm text-[rgba(244,242,236,0.85)] py-1 transition-colors duration-200 hover:text-accent"
            >
              Trabajá con nosotros
            </a>
          </div>
          <div>
            <h5 className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-[rgba(244,242,236,0.55)] m-0 mb-3.5 font-medium">
              Ayuda
            </h5>
            <a
              href="#contacto"
              className="block text-sm text-[rgba(244,242,236,0.85)] py-1 transition-colors duration-200 hover:text-accent"
            >
              Atención al cliente
            </a>
            <a
              href="#contacto"
              className="block text-sm text-[rgba(244,242,236,0.85)] py-1 transition-colors duration-200 hover:text-accent"
            >
              Soporte técnico
            </a>
            <a
              href="#contacto"
              className="block text-sm text-[rgba(244,242,236,0.85)] py-1 transition-colors duration-200 hover:text-accent"
            >
              Mudanzas
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-[var(--container-page)] mx-auto mt-[60px] pt-6 border-t border-white/10 flex justify-between gap-4 font-mono text-[11.5px] text-[rgba(244,242,236,0.45)] tracking-[0.04em] max-[700px]:flex-col">
        <span>© 2026 FlowCRM. Todos los derechos reservados.</span>
        <div className="legal-footer-links">
          <a href="#">Términos</a>
          <a href="#">Privacidad</a>
          <a href="#">Defensa del Consumidor</a>
        </div>
      </div>
    </footer>
  );
}

// ---------- Page ----------
export default function Home(): ReactNode {
  const { theme, setTheme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState("");
  const formRef = useRef<HTMLElement | null>(null);

  const scrollToForm = () => {
    const node = formRef.current;
    if (!node) return;
    window.scrollTo({
      top: node.getBoundingClientRect().top + window.scrollY - 40,
      behavior: "smooth",
    });
  };

  const onSelectPlan = (label: string) => {
    setSelectedPlan(label);
    setTimeout(scrollToForm, 30);
  };

  return (
    <main
      className="page min-h-screen pt-[68px] font-body bg-paper text-ink text-base leading-[1.55] overflow-x-hidden [&_a]:text-inherit [&_a]:no-underline [&_button]:font-[inherit] [&_button]:cursor-pointer [&_img]:max-w-full [&_img]:block"
      data-theme={theme}
    >
      <Nav onCTA={scrollToForm} theme={theme} onThemeChange={setTheme} />
      <Hero
        headline={DEFAULTS.headline}
        subhead={DEFAULTS.subhead}
        showWaves={DEFAULTS.showWaves}
        scrollToForm={scrollToForm}
      />
      <Plans defaultFilter={DEFAULTS.planFilter} onSelectPlan={onSelectPlan} />
      <WhyUs />
      <TVShowcase />
      <Process />
      <Coverage />
      <Testimonials />
      <FAQ />
      <FinalCTA formRef={formRef} prefilledPlan={selectedPlan} />
      <Footer />
    </main>
  );
}
