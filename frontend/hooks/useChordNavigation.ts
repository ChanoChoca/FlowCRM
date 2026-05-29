"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CHORD_MAP: Record<string, string> = {
  d: "/crm",
  v: "/crm/ventas",
  u: "/crm/usuarios",
  s: "/crm/soporte",
};

export function useChordNavigation(gPressed: boolean, onReset: () => void) {
  const router = useRouter();

  useEffect(() => {
    if (!gPressed) return;
    function onKey(e: KeyboardEvent) {
      const dest = CHORD_MAP[e.key.toLowerCase()];
      if (dest) {
        e.preventDefault();
        router.push(dest);
      }
      onReset();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gPressed, router, onReset]);
}
