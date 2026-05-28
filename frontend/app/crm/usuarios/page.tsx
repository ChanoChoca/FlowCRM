import { obtenerProvincias } from "@/app/actions/catalogo";
import {
  obtenerUsuarios,
  obtenerSupervisores,
  obtenerJefesDeSupervisor,
  UsuarioFilters,
} from "@/app/actions/usuarios";
import { getCurrentUser } from "@/app/actions/auth";
import { UsuarioAuthResponse } from "@/types/dtos";
import { Rol } from "@/types/enums";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Usuarios from "./Usuarios";
import Loading from "./loading";

const FILTER_KEYS: (keyof UsuarioFilters)[] = [
  "q",
  "nombre",
  "apellido",
  "dni",
  "rol",
  "activo",
  "supervisorId",
];

function scopeFilters(
  filters: UsuarioFilters,
  currentUser: UsuarioAuthResponse,
): UsuarioFilters {
  const rol = currentUser.rol;

  if (rol === Rol.ASESOR) {
    const supervisorId = currentUser.supervisor?.id;
    if (supervisorId != null) {
      return { ...filters, supervisorId: String(supervisorId) };
    }
    return { ...filters, supervisorId: String(currentUser.id) };
  }

  if (rol === Rol.SUPERVISOR || rol === Rol.JEFE_DE_SUPERVISOR) {
    return { ...filters, supervisorId: String(currentUser.id) };
  }

  return filters;
}

async function UsuariosContent({
  token,
  page,
  size,
  filters,
  currentUser,
}: {
  token: string;
  page: number;
  size: number;
  filters: UsuarioFilters;
  currentUser: UsuarioAuthResponse | null;
}) {
  const scopedFilters = currentUser ? scopeFilters(filters, currentUser) : filters;

  const [usuariosPage, supervisores, jefesDeSupervisor, provincias] =
    await Promise.all([
      obtenerUsuarios(token, page, size, scopedFilters),
      obtenerSupervisores(token),
      obtenerJefesDeSupervisor(token),
      obtenerProvincias(),
    ]);

  return (
    <Usuarios
      usuariosPage={usuariosPage}
      currentPage={page}
      currentSize={size}
      filters={scopedFilters}
      supervisores={supervisores}
      jefesDeSupervisor={jefesDeSupervisor}
      provincias={provincias}
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

  const filters: UsuarioFilters = {};
  for (const key of FILTER_KEYS) {
    if (params?.[key]) filters[key] = params[key];
  }
  if (!filters.activo) filters.activo = "true";

  const currentUser = await getCurrentUser();

  return (
    <Suspense fallback={<Loading />}>
      <UsuariosContent token={token} page={page} size={size} filters={filters} currentUser={currentUser} />
    </Suspense>
  );
}
