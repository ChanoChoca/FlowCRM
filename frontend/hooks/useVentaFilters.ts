import { VentaFilters } from "@/app/actions/ventas";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef } from "react";

export function useVentaFilters(
  filters: VentaFilters,
  currentSize: number,
) {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyFilters = useCallback(
    (patch: Partial<VentaFilters>) => {
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
    (patch: Partial<VentaFilters>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => applyFilters(patch), 400);
    },
    [applyFilters],
  );

  const clearFilters = useCallback(() => {
    router.push(`?page=0&size=${currentSize}`);
  }, [currentSize, router]);

  const loadView = useCallback(
    (viewFilters: VentaFilters) => {
      const params = new URLSearchParams({ page: "0", size: String(currentSize) });
      for (const [k, v] of Object.entries(viewFilters)) {
        if (v) params.set(k, v);
      }
      router.push(`?${params.toString()}`);
    },
    [currentSize, router],
  );

  const hasFilters = Object.values(filters).some(Boolean);

  const filterExtraParams = useMemo(() => {
    const extra: Record<string, string> = {};
    for (const [k, v] of Object.entries(filters)) {
      if (v) extra[k] = v;
    }
    return extra;
  }, [filters]);

  return { applyFilters, applyFilterDebounced, clearFilters, loadView, hasFilters, filterExtraParams };
}
