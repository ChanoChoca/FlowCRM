"use server";

import { parseRol } from "@/lib/mappers/rol";
import { UsuarioAuthResponse } from "@/types/dtos";
import { cookies } from "next/headers";

export async function desvincularGoogle(): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("token")?.value;
  if (!jwt) return { error: "No autenticado" };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/google/link`, {
      method: "DELETE",
      headers: { Cookie: `token=${jwt}` },
    });
    if (!res.ok) return { error: "No se pudo desvincular la cuenta de Google" };
    return {};
  } catch {
    return { error: "Error de conexión" };
  }
}

async function fetchCurrentUserByToken(
  jwt: string,
): Promise<UsuarioAuthResponse | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `token=${jwt}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as UsuarioAuthResponse;
    return { ...data, rol: parseRol(data.rol) };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UsuarioAuthResponse | null> {
  const cookieStore = await cookies();
  const jwt = cookieStore.get("token")?.value;
  if (!jwt) return null;

  return fetchCurrentUserByToken(jwt);
}

export async function hasAuthCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get("token")?.value);
}
