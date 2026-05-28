// AUTO-GENERATED — do not edit manually.
// Source: backend/src/main/java/com/flashpage/app/model/**/*.java
// Regenerate: node scripts/sync-types.mjs --force

export enum EstadoVenta {
  CANCELADA = "CANCELADA",
  RECHAZADA = "RECHAZADA",
  PENDIENTE = "PENDIENTE",
  INICIADA = "INICIADA",
  CUMPLIDA = "CUMPLIDA",
  PREVENTA = "PREVENTA",
  TICKET = "TICKET",
}

export enum AuditoriaHorario {
  AM = "AM",
  PM = "PM",
}

export const AuditoriaHorarioLabel: Record<AuditoriaHorario, string> = {
  [AuditoriaHorario.AM]: "Mañana",
  [AuditoriaHorario.PM]: "Tarde",
};

export enum InstalacionTurno {
  Mañana = "Mañana",
  Tarde = "Tarde",
  TodoElDia = "Todo el día",
}

export enum Origen {
  CRM = "CRM",
  POWER_APP = "POWER_APP",
}

export enum Rol {
  LIDER = 8,
  GERENTE = 7,
  ADMINISTRACION_RRHH_COBRANZA = 6,
  JEFE_DE_SUPERVISOR = 5,
  SUPERVISOR = 4,
  ASESOR = 3,
}

export enum TipoDocumento {
  DNI = "DNI",
  CUIL = "CUIL",
  CUIT = "CUIT",
  LC = "LC",
  LE = "LE",
  PASAPORTE = "PASAPORTE",
  CI = "CI",
  CE = "CE",
  CJ = "CJ",
  DNIF = "DNIF",
  DNIM = "DNIM",
}

export enum Ani {
  VENTA_DIRECTA = "VENTA_DIRECTA",
  PREVENTA = "PREVENTA",
  TICKET = "TICKET",
}

export enum TipoTarjeta {
  CREDITO = "CREDITO",
  DEBITO = "DEBITO",
}

export enum DesafioEstado {
  ACTIVO = "ACTIVO",
  COMPLETADO = "COMPLETADO",
  VENCIDO = "VENCIDO",
  CANCELADO = "CANCELADO",
}

export enum GestionEstado {
  PENDIENTE = "PENDIENTE",
  CONTACTADO = "CONTACTADO",
  INTERESADO = "INTERESADO",
  VENDIDO = "VENDIDO",
  NO_INTERESADO = "NO_INTERESADO",
  NO_CONTESTA = "NO_CONTESTA",
  NUMERO_INVALIDO = "NUMERO_INVALIDO",
}
