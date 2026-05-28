"use client";

import { useEffect, useRef, useState } from "react";
import { VentaRequest } from "@/types/dtos";

const STORAGE_KEY = "wmn_offline_ventas";

export interface PendingVenta {
  id: string;
  payload: VentaRequest;
  savedAt: number;
}

function loadQueue(): PendingVenta[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveQueue(queue: PendingVenta[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function useOfflineVentas() {
  const [isOnline, setIsOnline] = useState(true);
  const [pending, setPending] = useState<PendingVenta[]>([]);
  const syncingRef = useRef(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setPending(loadQueue());

    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  function enqueue(payload: VentaRequest) {
    const entry: PendingVenta = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      payload,
      savedAt: Date.now(),
    };
    const next = [...loadQueue(), entry];
    saveQueue(next);
    setPending(next);
    return entry.id;
  }

  async function sync(
    submitFn: (payload: VentaRequest) => Promise<{ error: string } | null>
  ): Promise<{ synced: number; failed: number }> {
    if (syncingRef.current || !isOnline) return { synced: 0, failed: 0 };
    syncingRef.current = true;

    const queue = loadQueue();
    let synced = 0;
    let failed = 0;
    const remaining: PendingVenta[] = [];

    for (const item of queue) {
      const result = await submitFn(item.payload);
      if (result === null) {
        synced++;
      } else {
        failed++;
        remaining.push(item);
      }
    }

    saveQueue(remaining);
    setPending(remaining);
    syncingRef.current = false;

    return { synced, failed };
  }

  function remove(id: string) {
    const next = loadQueue().filter((item) => item.id !== id);
    saveQueue(next);
    setPending(next);
  }

  function clearAll() {
    saveQueue([]);
    setPending([]);
  }

  return { isOnline, pending, enqueue, sync, remove, clearAll };
}
