"use client";

import { usePlatform } from "@/hooks/usePlatform";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ShortcutEntry {
  keys: string[];
  description: string;
  /** true = keys pressed simultaneously (shown with +), false/omitted = sequential chord (shown with "luego") */
  simultaneous?: boolean;
}

const NAV_SECTIONS: { title: string; shortcuts: ShortcutEntry[] }[] = [
  {
    title: "Navegación",
    shortcuts: [
      { keys: ["G", "D"], description: "Ir al Dashboard" },
      { keys: ["G", "V"], description: "Ir a Ventas" },
      { keys: ["G", "U"], description: "Ir a Usuarios" },
      { keys: ["G", "S"], description: "Ir a Soporte" },
    ],
  },
  {
    title: "Ventas",
    shortcuts: [
      { keys: ["N"], description: "Nueva venta (solo Asesor)" },
      { keys: ["E"], description: "Exportar Excel" },
    ],
  },
  {
    title: "General",
    shortcuts: [
      { keys: ["?"], description: "Mostrar esta ayuda", simultaneous: true },
    ],
  },
];

function Kbd({ label }: { label: string }) {
  return (
    <kbd className="inline-flex min-w-6 items-center justify-center rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-neutral-700 shadow-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
      {label}
    </kbd>
  );
}

export default function KeyboardShortcutsPanel({
  onClose,
}: {
  onClose: () => void;
}) {
  const { modKey, isMac } = usePlatform();

  // On Mac, ? is a direct key; on Windows/Linux it requires Shift
  const helpKeys = isMac ? ["?"] : ["Shift", "?"];

  const sections = [
    NAV_SECTIONS[0],
    {
      title: "Búsqueda",
      shortcuts: [
        {
          keys: [modKey, "K"],
          description: "Abrir búsqueda global",
          simultaneous: true,
        },
        { keys: ["Esc"], description: "Cerrar modal / panel" },
      ],
    },
    ...NAV_SECTIONS.slice(1, -1),
    {
      title: "General",
      shortcuts: [
        {
          keys: helpKeys,
          description: "Mostrar esta ayuda",
          simultaneous: true,
        },
      ],
    },
  ];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200/80 bg-white shadow-2xl dark:border-neutral-700/80 dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-200/70 px-5 py-4 dark:border-neutral-700/70">
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Atajos de teclado
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Presioná{" "}
              {helpKeys.map((k, i) => (
                <span key={k} className="inline-flex items-center gap-0.5">
                  <Kbd label={k} />
                  {i < helpKeys.length - 1 && <span className="mx-0.5">+</span>}
                </span>
              ))}{" "}
              para abrir / cerrar
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid max-h-[70vh] grid-cols-2 gap-6 overflow-y-auto p-5">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {section.title}
              </p>
              <div className="flex flex-col gap-2.5">
                {section.shortcuts.map((s) => (
                  <div
                    key={s.description}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      {s.description}
                    </span>
                    <div className="flex shrink-0 items-center gap-1">
                      {s.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <Kbd label={k} />
                          {i < s.keys.length - 1 && (
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                              {s.simultaneous ? "+" : "luego"}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
