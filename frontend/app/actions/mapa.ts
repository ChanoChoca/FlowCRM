"use server";

import { cookies } from "next/headers";

export interface VentaMapaPoint {
  id: number;
  clienteNombre: string;
  asesorNombre: string;
  productoNombre: string;
  centralNombre: string;
  estado: string;
  lat: number;
  lng: number;
  localidad: string;
  provincia: string;
}

export async function obtenerVentasMapa(
  desde?: string,
  hasta?: string,
): Promise<VentaMapaPoint[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("No autenticado");

  const params = new URLSearchParams();
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);

  const qs = params.size ? `?${params.toString()}` : "";
  const res = await fetch(`${process.env.NEXT_PUBLIC_API}/ventas/mapa${qs}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.mensaje ?? "No se pudo cargar el mapa de ventas");
  }

  return res.json();
}
