"use server";

import {
  PageResponse,
  VentaDetalleResponse,
  VentaRequest,
  VentaResponse,
} from "@/types/dtos";
import {
  Ani,
  AuditoriaHorario,
  AuditoriaHorarioLabel,
  Origen,
  TipoTarjeta,
} from "@/types/enums";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const VENTAS_PATH = "/crm/ventas";

async function getToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("No autenticado");
  }

  return token;
}

async function apiFetch(path: string, init: RequestInit = {}, token?: string) {
  const authToken = token ?? (await getToken());

  return fetch(`${process.env.NEXT_PUBLIC_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
    signal: init.signal ?? AbortSignal.timeout(10_000),
  });
}

function getString(formData: FormData, key: string, required = true) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    if (required) throw new Error(`${key} es obligatorio`);
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed && required) throw new Error(`${key} es obligatorio`);

  return trimmed || null;
}

function getNumber(formData: FormData, key: string, required = true) {
  const raw = getString(formData, key, required);

  if (raw === null) {
    if (required) throw new Error(`${key} es obligatorio`);
    return null;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${key} debe ser numérico`);
  }

  return parsed;
}

function getBoolean(formData: FormData, key: string, required = true) {
  const raw = getString(formData, key, required);

  if (raw === null) {
    if (required) throw new Error(`${key} es obligatorio`);
    return null;
  }

  if (raw === "true") return true;
  if (raw === "false") return false;

  throw new Error(`${key} debe ser true o false`);
}

function getEnum<T extends string>(
  formData: FormData,
  key: string,
  allowed: readonly T[],
  required = true,
) {
  const raw = getString(formData, key, required);

  if (raw === null) {
    if (required) throw new Error(`${key} es obligatorio`);
    return null;
  }

  if (!allowed.includes(raw as T)) {
    throw new Error(`${key} no es válido`);
  }

  return raw as T;
}

export interface VentaFilters {
  cliente?: string;
  asesorId?: string;
  supervisorId?: string;
  jefeDeSupervisorId?: string;
  origen?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
}

export async function obtenerVentas(
  token: string,
  page = 0,
  size = 10,
  filters: VentaFilters = {},
): Promise<PageResponse<VentaResponse>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }

  const res = await apiFetch(`/ventas?${params.toString()}`, {}, token);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.mensaje ?? "No se pudieron obtener las ventas");
  }

  return res.json();
}

export async function obtenerVentaPorId(
  id: number,
  token?: string,
): Promise<VentaDetalleResponse> {
  const res = await apiFetch(`/ventas/${id}`, {}, token);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.mensaje ?? "No se pudo obtener la venta");
  }

  return res.json() as Promise<VentaDetalleResponse>;
}

export type VentaActionState = { error: string } | null;

export async function crearVenta(
  _prev: VentaActionState,
  formData: FormData,
): Promise<VentaActionState> {
  let token: string;
  try {
    token = await getToken();
  } catch {
    return { error: "No autenticado" };
  }

  let payload: VentaRequest;
  try {
    payload = {
      asesorId: getNumber(formData, "asesorId", false),
      promoId: getNumber(formData, "promoId")!,
      centralId: getNumber(formData, "centralId")!,
      ani: getEnum(formData, "ani", Object.values(Ani) as Ani[])!,
      decos: getNumber(formData, "decos")!,
      contacto: getEnum(
        formData,
        "contacto",
        Object.values(AuditoriaHorario) as AuditoriaHorario[],
      )!,

      origen: Origen.CRM,

      observaciones: (() => {
        const contacto = getEnum(
          formData,
          "contacto",
          Object.values(AuditoriaHorario) as AuditoriaHorario[],
          false,
        );
        const auditoriaLabel = contacto ? AuditoriaHorarioLabel[contacto] : "";
        const atencion = getString(formData, "instalacionTurno", false) ?? "";
        return `horario de auditoría: ${auditoriaLabel}\nhorario de atención: ${atencion}`;
      })(),

      cliente: {
        nombre: getString(formData, "cliente.nombre")!,
        numeroDocumento: getString(formData, "cliente.numeroDocumento")!,
        email: getString(formData, "cliente.email")!,
        telefono: getString(formData, "cliente.telefono")!,
        domicilio: {
          calle: getString(formData, "cliente.domicilio.calle")!,
          numero: getString(formData, "cliente.domicilio.numero")!,
          piso: getString(formData, "cliente.domicilio.piso", false),
          depto: getString(formData, "cliente.domicilio.depto", false),
          entreCalles1: getString(formData, "cliente.domicilio.entreCalles1")!,
          entreCalles2: getString(formData, "cliente.domicilio.entreCalles2")!,
          entreCalles3: getString(formData, "cliente.domicilio.entreCalles3")!,
          coordenadas: getString(
            formData,
            "cliente.domicilio.coordenadas",
            false,
          ),
          observaciones: getString(
            formData,
            "cliente.domicilio.observaciones",
            false,
          ),
          localidad: getString(formData, "cliente.domicilio.localidad")!,
          codigoPostal: getString(formData, "cliente.domicilio.codigoPostal")!,
          provincia: {
            id: getNumber(formData, "cliente.domicilio.provinciaId"),
          },
        } as any,
      } as any,

      pago: {
        tipoTarjeta: getEnum(
          formData,
          "pago.tipoTarjeta",
          Object.values(TipoTarjeta) as TipoTarjeta[],
        )!,
        banco: getString(formData, "pago.banco")!,
        numeroTarjeta: getString(formData, "pago.numeroTarjeta")!,
        titular: getString(formData, "pago.titular")!,
      } as any,

      fechaNacimiento: getString(formData, "cliente.fechaNacimiento", false),
      miga: getString(formData, "cliente.domicilio.miga", false),
    };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Datos del formulario inválidos",
    };
  }

  let res: Response;
  try {
    res = await apiFetch(
      "/ventas",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token,
    );
  } catch {
    return { error: "No se pudo conectar con el servidor" };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: data.mensaje ?? "No se pudo crear la venta" };
  }

  revalidatePath(VENTAS_PATH);
  return null;
}

export async function submitOfflineVenta(
  payload: VentaRequest,
): Promise<{ error: string } | null> {
  let token: string;
  try {
    token = await getToken();
  } catch {
    return { error: "No autenticado" };
  }

  let res: Response;
  try {
    res = await apiFetch(
      "/ventas",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    );
  } catch {
    return { error: "No se pudo conectar con el servidor" };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: data.mensaje ?? "No se pudo crear la venta" };
  }

  revalidatePath(VENTAS_PATH);
  return null;
}

export async function cambiarEstadoVenta(
  id: number,
  estado: string,
): Promise<{ error: string } | null> {
  let token: string;
  try {
    token = await getToken();
  } catch {
    return { error: "No autenticado" };
  }

  let res: Response;
  try {
    res = await apiFetch(
      `/ventas/${id}?estado=${encodeURIComponent(estado)}`,
      { method: "PATCH" },
      token,
    );
  } catch {
    return { error: "No se pudo conectar con el servidor" };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: data.mensaje ?? "No se pudo cambiar el estado" };
  }

  revalidatePath(VENTAS_PATH);
  return null;
}
