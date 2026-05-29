"use server";

import { cookies } from "next/headers";

export async function getToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("No autenticado");
  return token;
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<Response> {
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

export function getString(
  formData: FormData,
  key: string,
  required = true,
): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") {
    if (required) throw new Error(`${key} es obligatorio`);
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed && required) throw new Error(`${key} es obligatorio`);
  return trimmed || null;
}

export function getNumber(
  formData: FormData,
  key: string,
  required = true,
): number | null {
  const raw = getString(formData, key, required);
  if (raw === null) {
    if (required) throw new Error(`${key} es obligatorio`);
    return null;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) throw new Error(`${key} debe ser numérico`);
  return parsed;
}

export function getBoolean(
  formData: FormData,
  key: string,
  required = true,
): boolean | null {
  const raw = getString(formData, key, required);
  if (raw === null) {
    if (required) throw new Error(`${key} es obligatorio`);
    return null;
  }
  if (raw === "true") return true;
  if (raw === "false") return false;
  throw new Error(`${key} debe ser true o false`);
}

export function getEnum<T extends string>(
  formData: FormData,
  key: string,
  allowed: readonly T[],
  required = true,
): T | null {
  const raw = getString(formData, key, required);
  if (raw === null) {
    if (required) throw new Error(`${key} es obligatorio`);
    return null;
  }
  if (!allowed.includes(raw as T)) throw new Error(`${key} no es válido`);
  return raw as T;
}
