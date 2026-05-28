"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NotificacionResponse } from "@/types/notificaciones";

const API = process.env.NEXT_PUBLIC_API!;

export function useNotifications() {
  const [notificaciones, setNotificaciones] = useState<NotificacionResponse[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const esRef = useRef<EventSource | null>(null);

  const cargar = useCallback(async () => {
    try {
      const res = await fetch(`${API}/notificaciones`, { credentials: "include" });
      if (!res.ok) return;
      const data: NotificacionResponse[] = await res.json();
      setNotificaciones(data);
      setNoLeidas(data.filter((n) => !n.leida).length);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();

    const es = new EventSource(`${API}/notificaciones/stream`, { withCredentials: true });
    esRef.current = es;

    es.addEventListener("notificacion", (e) => {
      const nueva: NotificacionResponse = JSON.parse(e.data);
      setNotificaciones((prev) => [nueva, ...prev]);
      setNoLeidas((c) => c + 1);
    });

    es.addEventListener("count", (e) => {
      setNoLeidas(Number(e.data));
    });

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [cargar]);

  const marcarLeida = useCallback(async (id: number) => {
    const res = await fetch(`${API}/notificaciones/${id}/leer`, {
      method: "PATCH",
      credentials: "include",
    });
    if (!res.ok) return;
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
    setNoLeidas((c) => Math.max(0, c - 1));
  }, []);

  const marcarTodasLeidas = useCallback(async () => {
    await fetch(`${API}/notificaciones/leer-todas`, {
      method: "PATCH",
      credentials: "include",
    });
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    setNoLeidas(0);
  }, []);

  const eliminar = useCallback(async (id: number) => {
    await fetch(`${API}/notificaciones/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setNotificaciones((prev) => {
      const removed = prev.find((n) => n.id === id);
      if (removed && !removed.leida) setNoLeidas((c) => Math.max(0, c - 1));
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  return { notificaciones, noLeidas, cargando, marcarLeida, marcarTodasLeidas, eliminar };
}
