"use client";

import type { Theme } from "@/hooks/useTheme";

export default function ThemeToggle({
  theme,
  background,
  onChange,
}: {
  theme: Theme;
  background?: boolean;
  onChange: (next: Theme) => void;
}) {
  const isLight = theme === "light";
  return (
    <button
      type="button"
      className={background ? "bg-white! theme-toggle" : "theme-toggle"}
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? "Cambiar a tema oscuro" : "Cambiar a tema claro"}
      onClick={() => onChange(isLight ? "dark" : "light")}
    >
      <span className="tt-track">
        <span className="tt-icon tt-sun" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </g>
          </svg>
        </span>
        <span className="tt-icon tt-moon" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        </span>
        <span className="tt-thumb" aria-hidden="true" />
      </span>
    </button>
  );
}
