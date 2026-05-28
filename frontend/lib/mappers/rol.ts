import { Rol } from "@/types/enums";

export function parseRol(value: unknown): Rol | undefined {
  switch (value) {
    case "LIDER":
    case Rol.LIDER:
      return Rol.LIDER;
    case "GERENTE":
    case Rol.GERENTE:
      return Rol.GERENTE;
    case "ADMINISTRACION_RRHH_COBRANZA":
    case Rol.ADMINISTRACION_RRHH_COBRANZA:
      return Rol.ADMINISTRACION_RRHH_COBRANZA;
    case "JEFE_DE_SUPERVISOR":
    case Rol.JEFE_DE_SUPERVISOR:
      return Rol.JEFE_DE_SUPERVISOR;
    case "SUPERVISOR":
    case Rol.SUPERVISOR:
      return Rol.SUPERVISOR;
    case "ASESOR":
    case Rol.ASESOR:
      return Rol.ASESOR;
    default:
      return undefined;
  }
}

export function rolLabel(rol?: Rol) {
  switch (rol) {
    case Rol.LIDER:
      return "LIDER";
    case Rol.GERENTE:
      return "GERENTE";
    case Rol.ADMINISTRACION_RRHH_COBRANZA:
      return "ADMINISTRACION_RRHH_COBRANZA";
    case Rol.JEFE_DE_SUPERVISOR:
      return "JEFE_DE_SUPERVISOR";
    case Rol.SUPERVISOR:
      return "SUPERVISOR";
    case Rol.ASESOR:
      return "ASESOR";
    default:
      return "";
  }
}

export function rolOptions(currentUserRol?: Rol) {
  switch (currentUserRol) {
    case Rol.LIDER:
      return [
        Rol.LIDER,
        Rol.GERENTE,
        Rol.ADMINISTRACION_RRHH_COBRANZA,
        Rol.JEFE_DE_SUPERVISOR,
        Rol.SUPERVISOR,
        Rol.ASESOR,
      ];
    case Rol.GERENTE:
      return [Rol.JEFE_DE_SUPERVISOR, Rol.SUPERVISOR, Rol.ASESOR];
    case Rol.ADMINISTRACION_RRHH_COBRANZA:
      return [
        Rol.LIDER,
        Rol.GERENTE,
        Rol.ADMINISTRACION_RRHH_COBRANZA,
        Rol.JEFE_DE_SUPERVISOR,
        Rol.SUPERVISOR,
        Rol.ASESOR,
      ];
    case Rol.JEFE_DE_SUPERVISOR:
      return [Rol.SUPERVISOR, Rol.ASESOR];
    case Rol.SUPERVISOR:
      return [Rol.ASESOR];
    default:
      return [];
  }
}
