"use server";

import type {
  ActividadUsuario,
  Dashboard,
  DashboardFiltro,
  RankingOpcional,
} from "@/types/dashboard";
import type { PageResponse } from "@/types/dtos";
import { cookies } from "next/headers";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function buildQueryParams(filtro?: Partial<DashboardFiltro>) {
  const params = new URLSearchParams();

  if (filtro?.desde) params.set("desde", filtro.desde);
  if (filtro?.hasta) params.set("hasta", filtro.hasta);
  if (filtro?.centralId != null)
    params.set("centralId", String(filtro.centralId));
  if (filtro?.productoId != null)
    params.set("productoId", String(filtro.productoId));
  if (filtro?.promoId != null) params.set("promoId", String(filtro.promoId));
  if (filtro?.origen) params.set("origen", filtro.origen);

  return params.toString();
}

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    const details = isJson
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null);
    throw new ApiError(
      `Error ${response.status} al llamar al backend`,
      response.status,
      details,
    );
  }

  return (isJson ? await response.json() : null) as T;
}

export async function getDashboardAction(
  filtro?: Partial<DashboardFiltro>,
): Promise<Dashboard> {
  const headers = await getAuthHeaders();
  const query = buildQueryParams(filtro);
  const url = query
    ? `${process.env.NEXT_PUBLIC_API}/dashboard?${query}`
    : `${process.env.NEXT_PUBLIC_API}/dashboard`;

  const response = await fetch(url, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return parseResponse<Dashboard>(response);
}

export async function obtenerActividadUsuariosAction(
  page = 0,
  size = 10,
  sortBy = "ventasMes",
  sortDir = "desc",
): Promise<PageResponse<ActividadUsuario>> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sortBy,
    sortDir,
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API}/dashboard/actividad-usuarios?${params.toString()}`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    },
  );

  return parseResponse<PageResponse<ActividadUsuario>>(response);
}

export async function toggleRankingAction(): Promise<RankingOpcional> {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API}/dashboard/ranking/toggle`,
    {
      method: "POST",
      headers,
      cache: "no-store",
    },
  );

  return parseResponse<RankingOpcional>(response);
}
