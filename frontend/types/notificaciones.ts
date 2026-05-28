export enum TipoNotificacion {
  VENTA_ASIGNADA = "VENTA_ASIGNADA",
  TICKET_RESPONDIDO = "TICKET_RESPONDIDO",
  TICKET_CREADO = "TICKET_CREADO",
  META_ALCANZADA = "META_ALCANZADA",
  ANUNCIO = "ANUNCIO",
  ESCALAMIENTO = "ESCALAMIENTO",
}

export interface NotificacionResponse {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  referenciaId: number | null;
  leida: boolean;
  creadoEn: string;
}
