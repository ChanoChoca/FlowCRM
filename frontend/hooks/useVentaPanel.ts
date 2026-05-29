"use client";

import { obtenerVentaPorId } from "@/app/actions/ventas";
import { VentaDetalleResponse } from "@/types/dtos";
import { useCallback, useState } from "react";

type PanelState =
  | { mode: "closed" }
  | {
      mode: "view";
      id: number;
      detail: VentaDetalleResponse | null;
      loading: boolean;
    };

export function useVentaPanel() {
  const [panel, setPanel] = useState<PanelState>({ mode: "closed" });

  const openDetail = useCallback(async (id: number) => {
    setPanel({ mode: "view", id, detail: null, loading: true });
    try {
      const detail = await obtenerVentaPorId(id);
      setPanel({ mode: "view", id, detail, loading: false });
    } catch {
      setPanel({ mode: "closed" });
    }
  }, []);

  const closePanel = useCallback(() => setPanel({ mode: "closed" }), []);

  return { panel, openDetail, closePanel };
}
