"use client";

import { useState } from "react";
import { Award, Lock } from "lucide-react";
import type { Badge } from "@/types/dashboard";

function BadgeItem({ badge }: { badge: Badge }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="relative flex flex-col items-center gap-2"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 hover:scale-110 ${
          badge.desbloqueado
            ? "bg-linear-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25 dark:shadow-purple-500/15"
            : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
        }`}
      >
        {badge.desbloqueado ? (
          <Award className="h-7 w-7" />
        ) : (
          <Lock className="h-5 w-5" />
        )}
      </div>
      <span
        className={`text-center text-xs font-medium ${
          badge.desbloqueado ? "text-neutral-700 dark:text-neutral-200" : "text-neutral-400 dark:text-neutral-500"
        }`}
      >
        {badge.nombre}
      </span>

      {hover && (
        <div className="absolute -top-2 left-1/2 z-10 w-48 -translate-x-1/2 -translate-y-full rounded-xl bg-neutral-900 p-3 text-xs text-white shadow-xl dark:bg-neutral-800">
          <p className="font-semibold">{badge.nombre}</p>
          <p className="mt-0.5 text-neutral-300 dark:text-neutral-400">{badge.descripcion}</p>
          {!badge.desbloqueado && (
            <p className="mt-1 text-purple-300">{badge.condicion}</p>
          )}
          {badge.desbloqueado && badge.fechaDesbloqueo && (
            <p className="mt-1 text-emerald-300">
              Desbloqueado el{" "}
              {new Date(badge.fechaDesbloqueo).toLocaleDateString("es-AR")}
            </p>
          )}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-800" />
        </div>
      )}
    </div>
  );
}

export default function BadgeGallery({ badges }: { badges: Badge[] }) {
  if (!badges.length) return null;

  const unlocked = badges.filter((b) => b.desbloqueado);
  const locked = badges.filter((b) => !b.desbloqueado);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white/80 p-5 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/60">
      <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Insignias</h3>
      <div className="mt-4 flex flex-wrap gap-5">
        {unlocked.map((b) => (
          <BadgeItem key={b.codigo} badge={b} />
        ))}
        {locked.map((b) => (
          <BadgeItem key={b.codigo} badge={b} />
        ))}
      </div>
    </div>
  );
}
