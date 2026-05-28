import { UsuarioAuthResponse, UsuarioResponse } from "@/types/dtos";
import { Rol } from "@/types/enums";

export function esMismoUsuario(
  currentUser: UsuarioAuthResponse | null,
  target: UsuarioResponse,
) {
  return !!currentUser && currentUser.dni === target.dni;
}

export function puedeCrearUsuario(
  currentUser: UsuarioAuthResponse | null,
  rolDestino?: Rol,
) {
  if (!currentUser?.rol) return false;

  switch (currentUser.rol) {
    case Rol.LIDER:
      return rolDestino !== Rol.LIDER;

    case Rol.GERENTE:
      return (
        rolDestino === undefined ||
        rolDestino === Rol.JEFE_DE_SUPERVISOR ||
        rolDestino === Rol.SUPERVISOR ||
        rolDestino === Rol.ASESOR
      );

    case Rol.ADMINISTRACION_RRHH_COBRANZA:
      return true;

    case Rol.JEFE_DE_SUPERVISOR:
      return (
        rolDestino === undefined ||
        rolDestino === Rol.SUPERVISOR ||
        rolDestino === Rol.ASESOR
      );

    case Rol.SUPERVISOR:
      return rolDestino === undefined || rolDestino === Rol.ASESOR;

    case Rol.ASESOR:
      return false;

    default:
      return false;
  }
}

export function puedeEditarUsuario(
  currentUser: UsuarioAuthResponse | null,
  target: UsuarioResponse,
) {
  if (!currentUser?.rol) return false;

  if (esMismoUsuario(currentUser, target)) {
    return true;
  }

  switch (currentUser.rol) {
    case Rol.LIDER:
      return true;

    case Rol.GERENTE:
      return target.rol !== Rol.LIDER;

    case Rol.ADMINISTRACION_RRHH_COBRANZA:
      return true;

    case Rol.JEFE_DE_SUPERVISOR:
      return target.rol === Rol.SUPERVISOR || target.rol === Rol.ASESOR;

    case Rol.SUPERVISOR:
      return target.rol === Rol.ASESOR;

    case Rol.ASESOR:
      return false;

    default:
      return false;
  }
}

export function puedeCambiarPassword(
  currentUser: UsuarioAuthResponse | null,
  target: UsuarioResponse,
) {
  if (!currentUser?.rol) return false;

  if (esMismoUsuario(currentUser, target)) {
    return (
      currentUser.rol === Rol.LIDER || currentUser.rol === Rol.GERENTE
    );
  }

  switch (currentUser.rol) {
    case Rol.LIDER:
      return true;

    case Rol.GERENTE:
      return target.rol !== Rol.LIDER;

    default:
      return false;
  }
}

export function puedeDesactivarUsuario(
  currentUser: UsuarioAuthResponse | null,
  target: UsuarioResponse,
) {
  if (!currentUser?.rol) return false;
  if (esMismoUsuario(currentUser, target)) return false;

  switch (currentUser.rol) {
    case Rol.LIDER:
      return true;

    case Rol.GERENTE:
      return target.rol !== Rol.LIDER;

    case Rol.ADMINISTRACION_RRHH_COBRANZA:
      return target.rol !== Rol.LIDER && target.rol !== Rol.GERENTE;

    case Rol.JEFE_DE_SUPERVISOR:
      return target.rol === Rol.SUPERVISOR || target.rol === Rol.ASESOR;

    case Rol.SUPERVISOR:
      return target.rol === Rol.ASESOR;

    case Rol.ASESOR:
      return false;

    default:
      return false;
  }
}
