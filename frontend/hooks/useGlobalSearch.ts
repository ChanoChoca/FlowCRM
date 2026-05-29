"use client";

import { EstadoVenta, Rol } from "@/types/enums";
import { useCurrentUser } from "@/context/CurrentUserContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface VentaResult {
  id: number;
  clienteNombre: string;
  producto: string;
  central: string;
  estado: EstadoVenta;
}

export interface UsuarioResult {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  activo: boolean;
}

export interface SearchResults {
  ventas: VentaResult[];
  usuarios: UsuarioResult[];
}

export type FlatResult =
  | { type: "usuario"; item: UsuarioResult }
  | { type: "venta"; item: VentaResult };

export function useGlobalSearch() {
  const router = useRouter();
  const currentUser = useCurrentUser();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ ventas: [], usuarios: [] });
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const showUsuarios = currentUser?.rol !== Rol.ASESOR;

  const flatResults: FlatResult[] = useMemo(
    () => [
      ...(showUsuarios
        ? results.usuarios.map((u) => ({ type: "usuario" as const, item: u }))
        : []),
      ...results.ventas.map((v) => ({ type: "venta" as const, item: v })),
    ],
    [results, showUsuarios],
  );

  const hasResults =
    (showUsuarios && results.usuarios.length > 0) || results.ventas.length > 0;

  const navigate = useCallback(
    (entry: FlatResult, onClose: () => void) => {
      if (entry.type === "usuario") {
        router.push(`/crm/usuarios?q=${encodeURIComponent(entry.item.dni)}`);
      } else {
        router.push(
          `/crm/ventas?cliente=${encodeURIComponent(entry.item.clienteNombre)}`,
        );
      }
      onClose();
    },
    [router],
  );

  const clearResults = useCallback(() => {
    setResults({ ventas: [], usuarios: [] });
    setActiveIndex(0);
    if (abortRef.current) abortRef.current.abort();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    const q = query.trim();
    if (!q) {
      setResults({ ventas: [], usuarios: [] });
      setLoading(false);
      setActiveIndex(0);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/buscar?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data: SearchResults = await res.json();
        setResults(data);
        setActiveIndex(0);
      } catch {
        if (!controller.signal.aborted) {
          setResults({ ventas: [], usuarios: [] });
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      controller.abort();
    };
  }, [query]);

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    onClose: () => void,
  ) {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") {
      if (!flatResults.length) return;
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      if (!flatResults.length) return;
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter" && flatResults[activeIndex]) {
      e.preventDefault();
      navigate(flatResults[activeIndex], onClose);
    }
  }

  return {
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
  };
}
