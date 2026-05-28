export enum EstadoTicket {
  PENDIENTE = "PENDIENTE",
  APROBADO = "APROBADO",
  RECHAZADO = "RECHAZADO",
}

export interface TicketMensajeResponse {
  id: number;
  autorId: number;
  autorNombre: string;
  autorApellido: string;
  contenido: string;
  creadoEn: string;
}

export interface TicketResponse {
  id: number;
  creadorId: number;
  creadorNombre: string;
  creadorApellido: string;
  asignadoId: number | null;
  asignadoNombre: string | null;
  asignadoApellido: string | null;
  titulo: string;
  descripcion: string;
  estado: EstadoTicket;
  mensajes: TicketMensajeResponse[];
  creadoEn: string;
  actualizadoEn: string;
}

export interface CreateTicketRequest {
  titulo: string;
  descripcion: string;
  asignadoId?: number | null;
}
