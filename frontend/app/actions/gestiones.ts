"use server";

import type {
  ConversionAsesorResumen,
  ConversionPropiaResumen,
} from "@/types/dashboard";
import { cookies } from "next/headers";

async function getToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("No autenticado");
  return token;
}

async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await getToken();
  return fetch(`${process.env.NEXT_PUBLIC_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
    signal: init.signal ?? AbortSignal.timeout(10_000),
  });
}

export async function getConversionPropiaAction(
  desde?: string,
  hasta?: string,
): Promise<ConversionPropiaResumen | null> {
  const params = new URLSearchParams();
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);

  const qs = params.toString();
  let res: Response;
  try {
    res = await apiFetch(`/gestiones/mis-estadisticas${qs ? `?${qs}` : ""}`);
  } catch {
    return null;
  }

  if (!res.ok) return null;
  return res.json();
}

export async function getConversionEquipoAction(
  desde?: string,
  hasta?: string,
): Promise<ConversionAsesorResumen[]> {
  const params = new URLSearchParams();
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);

  const qs = params.toString();
  let res: Response;
  try {
    res = await apiFetch(`/gestiones/equipo/conversion${qs ? `?${qs}` : ""}`);
  } catch {
    return [];
  }

  if (!res.ok) return [];
  return res.json();
}
