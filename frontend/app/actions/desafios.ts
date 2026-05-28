"use server";

import type { DesafioRequest, DesafioResponse } from "@/types/dashboard";
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

export type DesafioActionState = { error: string } | null;

export async function crearDesafioAction(
  _prev: DesafioActionState,
  formData: FormData,
): Promise<DesafioActionState> {
  const titulo = (formData.get("titulo") as string)?.trim();
  const descripcion = (formData.get("descripcion") as string)?.trim() ?? "";
  const metaVentas = Number(formData.get("metaVentas"));
  const turno = formData.get("turno") as string;
  const fechaInicio = formData.get("fechaInicio") as string;
  const fechaVencimiento = formData.get("fechaVencimiento") as string;
  const productoIdRaw = formData.get("productoId") as string | null;
  const productoId =
    productoIdRaw && productoIdRaw !== "" ? Number(productoIdRaw) : null;

  if (!titulo) return { error: "El título es obligatorio" };
  if (!metaVentas || metaVentas <= 0)
    return { error: "La meta de ventas debe ser mayor a 0" };
  if (!turno || !["AM", "PM"].includes(turno))
    return { error: "El turno es obligatorio" };
  if (!fechaInicio) return { error: "La fecha de inicio es obligatoria" };
  if (!fechaVencimiento)
    return { error: "La fecha de vencimiento es obligatoria" };
  if (fechaVencimiento <= fechaInicio)
    return { error: "La fecha de vencimiento debe ser posterior al inicio" };

  const payload: DesafioRequest = {
    titulo,
    descripcion,
    metaVentas,
    turno: turno as DesafioRequest["turno"],
    productoId,
    fechaInicio,
    fechaVencimiento,
  };

  let res: Response;
  try {
    res = await apiFetch("/desafios", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    return { error: "No se pudo conectar con el servidor" };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: data.mensaje ?? "No se pudo crear el desafío" };
  }

  return null;
}

export async function cancelarDesafioAction(
  id: number,
): Promise<DesafioActionState> {
  let res: Response;
  try {
    res = await apiFetch(`/desafios/${id}/cancelar`, { method: "PUT" });
  } catch {
    return { error: "No se pudo conectar con el servidor" };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: data.mensaje ?? "No se pudo cancelar el desafío" };
  }

  return null;
}

export async function getHistorialDesafiosAction(): Promise<DesafioResponse[]> {
  let res: Response;
  try {
    res = await apiFetch("/desafios/historial");
  } catch {
    return [];
  }

  if (!res.ok) return [];
  return res.json();
}
