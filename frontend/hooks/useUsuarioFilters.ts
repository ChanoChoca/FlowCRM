"use client";

import { UsuarioFilters } from "@/app/actions/usuarios";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef } from "react";

export function useUsuarioFilters(filters: UsuarioFilters, currentSize: number) {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyFilters = useCallback(
    (patch: Partial<UsuarioFilters>) => {
      const merged = { ...filters, ...patch };
      const params = new URLSearchParams({ page: "0", size: String(currentSize) });
      for (const [k, v] of Object.entries(merged)) {
        if (v) params.set(k, v);
      }
      router.push(`?${params.toString()}`);
    },
    [filters, currentSize, router],
  );

  const applyFilterDebounced = useCallback(
    (patch: Partial<UsuarioFilters>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => applyFilters(patch), 400);
    },
    [applyFilters],
  );

  const clearFilters = useCallback(() => {
    router.push(`?page=0&size=${currentSize}`);
  }, [currentSize, router]);

  const hasFilters = Object.values(filters).some(Boolean);

  const filterExtraParams = useMemo(() => {
    const extra: Record<string, string> = {};
    for (const [k, v] of Object.entries(filters)) {
      if (v) extra[k] = v;
    }
    return extra;
  }, [filters]);

  return { applyFilters, applyFilterDebounced, clearFilters, hasFilters, filterExtraParams };
}
