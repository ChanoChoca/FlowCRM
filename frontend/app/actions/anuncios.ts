"use server";

import { cookies } from "next/headers";
import { AnuncioResponse, CreateAnuncioRequest } from "@/types/anuncios";

const API = process.env.NEXT_PUBLIC_API!;

async function authHeaders() {
  const jar = await cookies();
  const token = jar.get("token")?.value;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getAnuncios(): Promise<AnuncioResponse[]> {
  const res = await fetch(`${API}/anuncios`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al obtener anuncios");
  return res.json();
}

export async function publicarAnuncio(data: CreateAnuncioRequest): Promise<AnuncioResponse> {
  const res = await fetch(`${API}/anuncios`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al publicar anuncio");
  return res.json();
}

export async function marcarAnuncioLeido(id: number): Promise<AnuncioResponse> {
  const res = await fetch(`${API}/anuncios/${id}/leer`, {
    method: "PATCH",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Error al marcar anuncio");
  return res.json();
}

export async function eliminarAnuncio(id: number): Promise<void> {
  const res = await fetch(`${API}/anuncios/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar anuncio");
}
