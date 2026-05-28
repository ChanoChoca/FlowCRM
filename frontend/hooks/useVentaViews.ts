"use client";

import { VentaFilters } from "@/app/actions/ventas";
import { useCallback, useEffect, useState } from "react";

export interface SavedView {
  id: string;
  name: string;
  filters: VentaFilters;
  createdAt: number;
}

function storageKey(userDni: string) {
  return `venta_views_${userDni}`;
}

function readViews(userDni: string): SavedView[] {
  try {
    const raw = localStorage.getItem(storageKey(userDni));
    return raw ? (JSON.parse(raw) as SavedView[]) : [];
  } catch {
    return [];
  }
}

function writeViews(userDni: string, views: SavedView[]) {
  try {
    localStorage.setItem(storageKey(userDni), JSON.stringify(views));
  } catch {
    // quota exceeded — silently skip
  }
}

export function useVentaViews(userDni: string | undefined) {
  const [views, setViews] = useState<SavedView[]>([]);

  useEffect(() => {
    if (!userDni) return;
    setViews(readViews(userDni));
  }, [userDni]);

  const saveView = useCallback(
    (name: string, filters: VentaFilters) => {
      if (!userDni) return;
      const view: SavedView = {
        id: crypto.randomUUID(),
        name: name.trim(),
        filters,
        createdAt: Date.now(),
      };
      setViews((prev) => {
        const next = [...prev, view];
        writeViews(userDni, next);
        return next;
      });
    },
    [userDni],
  );

  const deleteView = useCallback(
    (id: string) => {
      if (!userDni) return;
      setViews((prev) => {
        const next = prev.filter((v) => v.id !== id);
        writeViews(userDni, next);
        return next;
      });
    },
    [userDni],
  );

  return { views, saveView, deleteView };
}
