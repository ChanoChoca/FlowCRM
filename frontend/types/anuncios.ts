import { Rol } from "./enums";

export interface AnuncioResponse {
  id: number;
  autorId: number;
  autorNombre: string;
  autorApellido: string;
  titulo: string;
  contenido: string;
  rolesDestino: Rol[];
  totalLecturas: number;
  leidoPorMi: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CreateAnuncioRequest {
  titulo: string;
  contenido: string;
  rolesDestino: Rol[];
}
