"use server";

import { apiFetch, getToken } from "@/lib/api.server";
import { parseRol, rolLabel } from "@/lib/mappers/rol";
import {
  AsesorOption,
  CreateUsuarioRequest,
  PageResponse,
  UsuarioDetalleResponse,
  UsuarioResponse,
  UsuarioSupervisorResponse,
} from "@/types/dtos";
import { Rol } from "@/types/enums";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

function requiredString(formData: FormData, key: string, label: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} es obligatorio`);
  }
  return value.trim();
}

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function optionalNumber(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function obtenerSupervisores(
  token: string,
): Promise<UsuarioSupervisorResponse[]> {
  const res = await apiFetch("/usuarios/supervisores", {}, token);

  if (!res.ok) return [];

  return res.json();
}

export async function obtenerJefesDeSupervisor(
  token: string,
): Promise<UsuarioSupervisorResponse[]> {
  const res = await apiFetch("/usuarios/jefes-de-supervisor", {}, token);

  if (!res.ok) return [];

  return res.json();
}

export async function obtenerAsesores(
  token: string,
  supervisorId?: number,
): Promise<AsesorOption[]> {
  const params = supervisorId != null ? `?supervisorId=${supervisorId}` : "";
  const res = await apiFetch(`/usuarios/asesores${params}`, {}, token);

  if (!res.ok) return [];

  return res.json();
}

export async function obtenerMisAsesores(): Promise<UsuarioSupervisorResponse[]> {
  const res = await apiFetch("/usuarios/mis-asesores");

  if (!res.ok) return [];

  return res.json();
}

export interface UsuarioFilters {
  q?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  rol?: string;
  activo?: string;
  supervisorId?: string;
}

export async function obtenerUsuarios(
  token: string,
  page = 0,
  size = 10,
  filters: UsuarioFilters = {},
): Promise<PageResponse<UsuarioResponse>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }

  const res = await apiFetch(`/usuarios?${params.toString()}`, {}, token);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.mensaje ?? "No se pudieron obtener los usuarios");
  }

  const data = (await res.json()) as PageResponse<UsuarioResponse>;
  return {
    ...data,
    content: data.content.map((u) => ({ ...u, rol: parseRol(u.rol) })),
  };
}

export async function obtenerDetalleUsuario(id: string, token?: string) {
  const authToken = token ?? (await getToken());

  const res = await apiFetch(`/usuarios/${id}`, {}, authToken);

  if (res.status === 404) return null;
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      data.mensaje ?? "No se pudo obtener el detalle del usuario",
    );
  }

  const data = (await res.json()) as UsuarioDetalleResponse;
  return { ...data, rol: parseRol(data.rol) };
}

export type UsuarioActionState = { error: string } | null;

export async function crearUsuario(
  _prev: UsuarioActionState,
  formData: FormData,
): Promise<UsuarioActionState> {
  let token: string;
  try {
    token = await getToken();
  } catch {
    return { error: "No autenticado" };
  }

  const rolNum = optionalNumber(formData, "rol");
  const payload: CreateUsuarioRequest = {
    dni: requiredString(formData, "dni", "DNI"),
    password: requiredString(formData, "password", "Contraseña"),
    rol:
      rolNum != null ? (rolLabel(rolNum as Rol) as unknown as Rol) : undefined,
    supervisorId: optionalNumber(formData, "supervisorId"),
    telefono: optionalString(formData, "telefono") ?? undefined,
    nombre: requiredString(formData, "nombre", "Nombre"),
    apellido: requiredString(formData, "apellido", "Apellido"),
    plazaUsername: optionalString(formData, "plazaUsername") ?? undefined,
    plazaPassword: optionalString(formData, "plazaPassword") ?? undefined,
  };

  const res = await apiFetch(
    "/usuarios",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token,
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: data.mensaje ?? "No se pudo crear el usuario" };
  }

  revalidatePath("/crm/usuarios");
  return null;
}

export async function actualizarUsuario(
  _prev: UsuarioActionState,
  formData: FormData,
): Promise<UsuarioActionState> {
  let token: string;
  try {
    token = await getToken();
  } catch {
    return { error: "No autenticado" };
  }

  const id = requiredString(formData, "id", "Id");

  const rolNum = optionalNumber(formData, "rol");
  const payload: Omit<
    UsuarioDetalleResponse,
    "ultimoLogin" | "creadoEn" | "actualizadoEn"
  > = {
    dni: requiredString(formData, "dni", "DNI"),

    password: optionalString(formData, "password") ?? undefined,

    rol:
      rolNum != null ? (rolLabel(rolNum as Rol) as unknown as Rol) : undefined,

    supervisorId: optionalNumber(formData, "supervisorId"),

    telefono: optionalString(formData, "telefono") ?? undefined,

    nombre: requiredString(formData, "nombre", "Nombre"),
    apellido: requiredString(formData, "apellido", "Apellido"),

    plazaUsername: optionalString(formData, "plazaUsername") ?? undefined,
    plazaPassword: optionalString(formData, "plazaPassword") ?? undefined,
  };

  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined),
  );

  const res = await apiFetch(
    `/usuarios/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(cleanPayload),
    },
    token,
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: data.mensaje ?? "No se pudo actualizar el usuario" };
  }

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    const match = setCookie.match(/token=([^;]+)/);
    if (match) {
      const cookieStore = await cookies();
      cookieStore.set("token", match[1], {
        httpOnly: true,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });
    }
  }

  revalidatePath("/crm");
  revalidatePath("/crm/usuarios");
  return null;
}

export async function desactivarUsuario(
  _prev: UsuarioActionState,
  formData: FormData,
): Promise<UsuarioActionState> {
  let token: string;
  try {
    token = await getToken();
  } catch {
    return { error: "No autenticado" };
  }
  const id = requiredString(formData, "id", "Id");

  const res = await apiFetch(
    `/usuarios/${id}/desactivar`,
    {
      method: "PATCH",
      body: JSON.stringify({ activo: false }),
    },
    token,
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: data.mensaje ?? "No se pudo desactivar el usuario" };
  }

  revalidatePath("/crm/usuarios");
  return null;
}

export async function activarUsuario(
  _prev: UsuarioActionState,
  formData: FormData,
): Promise<UsuarioActionState> {
  let token: string;
  try {
    token = await getToken();
  } catch {
    return { error: "No autenticado" };
  }
  const id = requiredString(formData, "id", "Id");

  const res = await apiFetch(
    `/usuarios/${id}/activar`,
    {
      method: "PATCH",
      body: JSON.stringify({ activo: false }),
    },
    token,
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { error: data.mensaje ?? "No se pudo activar el usuario" };
  }

  revalidatePath("/crm/usuarios");
  return null;
}
