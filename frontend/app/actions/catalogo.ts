"use server";

import { Central, Producto, Promo, Provincia } from "@/types/models";
import { cookies } from "next/headers";

export type CatalogosResponse = {
  productos: Producto[];
  promos: Promo[];
  provincias: Provincia[];
  centrales: Central[];
};

export async function obtenerCatalogos(): Promise<CatalogosResponse> {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    throw new Error("No autenticado");
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/catalogos`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.mensaje ?? "No se pudieron obtener los catálogos");
  }

  return res.json();
}

export async function obtenerProvincias(): Promise<Provincia[]> {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    throw new Error("No autenticado");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API}/catalogos/provincias`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.mensaje ?? "No se pudieron obtener las provincias");
  }

  return res.json();
}
