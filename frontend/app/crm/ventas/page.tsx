import { obtenerVentas, VentaFilters } from "@/app/actions/ventas";
import { obtenerCatalogos } from "@/app/actions/catalogo";
import { obtenerAsesores, obtenerSupervisores } from "@/app/actions/usuarios";
import { getCurrentUser } from "@/app/actions/auth";
import { UsuarioAuthResponse } from "@/types/dtos";
import { Rol } from "@/types/enums";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Ventas from "./Ventas";
import Loading from "./loading";

const FILTER_KEYS: (keyof VentaFilters)[] = [
  "cliente",
  "asesorId",
  "supervisorId",
  "jefeDeSupervisorId",
  "origen",
  "estado",
  "desde",
  "hasta",
];

function scopeFilters(
  filters: VentaFilters,
  currentUser: UsuarioAuthResponse,
): VentaFilters {
  const rol = currentUser.rol;

  if (rol === Rol.ASESOR) {
    return { ...filters, asesorId: String(currentUser.id), supervisorId: undefined, jefeDeSupervisorId: undefined };
  }

  if (rol === Rol.SUPERVISOR) {
    return { ...filters, supervisorId: String(currentUser.id), asesorId: undefined, jefeDeSupervisorId: undefined };
  }

  if (rol === Rol.JEFE_DE_SUPERVISOR) {
    return { ...filters, jefeDeSupervisorId: String(currentUser.id), supervisorId: undefined, asesorId: undefined };
  }

  return filters;
}

async function VentasContent({
  token,
  page,
  size,
  filters,
  currentUser,
}: {
  token: string;
  page: number;
  size: number;
  filters: VentaFilters;
  currentUser: UsuarioAuthResponse | null;
}) {
  const scopedFilters = currentUser ? scopeFilters(filters, currentUser) : filters;

  const [ventasPage, catalogos, supervisores, asesores] = await Promise.all([
    obtenerVentas(token, page, size, scopedFilters),
    obtenerCatalogos(),
    obtenerSupervisores(token),
    obtenerAsesores(token),
  ]);

  return (
    <Ventas
      ventasPage={ventasPage}
      currentPage={page}
      currentSize={size}
      filters={scopedFilters}
      catalogos={catalogos}
      supervisores={supervisores}
      asesores={asesores}
      scopedCurrentUser={currentUser}
    />
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/iniciar-sesion");

  const page = parseInt(params?.page ?? "0", 10);
  const size = parseInt(params?.size ?? "10", 10);

  const filters: VentaFilters = {};
  for (const key of FILTER_KEYS) {
    if (params?.[key]) filters[key] = params[key];
  }

  const currentUser = await getCurrentUser();

  return (
    <Suspense fallback={<Loading />}>
      <VentasContent token={token} page={page} size={size} filters={filters} currentUser={currentUser} />
    </Suspense>
  );
}
