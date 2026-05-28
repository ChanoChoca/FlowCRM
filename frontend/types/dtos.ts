// AUTO-GENERATED — do not edit manually.
// Source: backend/src/main/java/com/flashpage/app/model/**/*.java
// Regenerate: node scripts/sync-types.mjs --force

import { Ani, AuditoriaHorario, Origen, Rol, TipoDocumento } from "./enums";
import { Central, Pago, Producto, Promo, Provincia } from "./models";

export interface AsesorOption {
  id: number | null;
  nombre: string;
  apellido: string;
  supervisorId: number | null;
}

export interface AsesorDTO {
  id: number | null;
  dni: string;
  telefono: string;
  nombre: string;
  apellido: string;
}

export interface CatalogosResponse {
  productos: Producto[];
  promos: Promo[];
  provincias: Provincia[];
  centrales: Central[];
}

export interface ClienteDTO {
  id: number | null;
  nombre: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  telefono: string;
  email: string;
  domicilio: DomicilioDetalleDTO;
}

export interface DomicilioDetalleDTO {
  id: number | null;
  calle: string;
  numero: string;
  piso: string | null;
  depto: string | null;
  entreCalles1: string;
  entreCalles2: string;
  entreCalles3: string;
  coordenadas: string | null;
  localidad: string;
  codigoPostal: string;
  provincia: { id: number; nombre: string } | null;
  observaciones: string | null;
}

export interface PagoDTO {
  id: number | null;
  debitoAutomatico: boolean;
  tipoTarjeta: import("./enums").TipoTarjeta | null;
  banco: string;
  numeroTarjeta: string;
  titular: string;
}

export interface CreateUsuarioRequest {
  dni: string;
  password: string;
  rol?: Rol;
  supervisorId: number | null;
  telefono?: string;
  nombre: string;
  apellido: string;
  plazaUsername?: string;
  plazaPassword?: string;
}

export interface DomicilioDTO {
  id: number | null;
  calle: string;
  numero: string;
  piso: string | null;
  depto: string | null;
  entreCalles1: string;
  entreCalles2: string;
  entreCalles3: string;
  coordenadas: string | null;
  localidad: string;
  codigoPostal: string;
  provinciaId: number | null;
  observaciones: string | null;
}

export interface LoginRequest {
  dni: string;
  password: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface UsuarioAuthResponse {
  id: number;
  dni: string;
  password: string;
  rol?: Rol;
  supervisor?: UsuarioSupervisorResponse;
  telefono?: string;
  nombre: string;
  apellido: string;
  plazaUsername?: string;
  plazaPassword?: string;
  activo: boolean | null;
  rankingOptActivo: boolean | null;
  ultimoLogin: string | null;
  creadoEn: string | null;
  actualizadoEn: string | null;
  email?: string | null;
  googleVinculado?: boolean | null;
}

export interface UsuarioDetalleResponse {
  dni: string;
  password?: string;
  rol?: Rol;
  supervisorId: number | null;
  telefono?: string;
  nombre: string;
  apellido: string;
  plazaUsername?: string;
  plazaPassword?: string;
  ultimoLogin: string | null;
  creadoEn: string | null;
  actualizadoEn: string | null;
  email?: string | null;
  googleVinculado?: boolean | null;
}

export interface UsuarioResponse {
  id: number | null;
  dni: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rol?: Rol;
  supervisor?: UsuarioSupervisorResponse;
  activo: boolean;
  rankingOptActivo: boolean;
  ultimoLogin: string | null;
  creadoEn: string | null;
}

export interface UsuarioSupervisorResponse {
  id: number | null;
  nombre: string;
  apellido: string;
}

export interface VentaDetalleResponse {
  id: number | null;
  asesor: AsesorDTO;
  cliente: ClienteDTO;
  productoNombre: string;
  promoNombre: string;
  centralNombre: string;
  ani: Ani;
  decos: number | null;
  contacto: AuditoriaHorario;
  pago: PagoDTO;
  observaciones: string;
  origen: Origen;
  estado: import("./enums").EstadoVenta;
  creadoEn: string | null;
  actualizadoEn: string | null;
}

export interface VentaRequest {
  asesorId?: number | null;
  promoId: number | null;
  centralId: number | null;
  ani: Ani;
  decos: number | null;
  contacto: AuditoriaHorario;
  origen: Origen;
  observaciones: string | null;
  cliente: ClienteDTO;
  pago: Pago;
  fechaNacimiento: string | null;
  miga: string | null;
}

export interface VentaResponse {
  id: number | null;
  clienteNombre: string;
  promo: string;
  asesorNombre: string;
  asesorApellido: string;
  supervisorNombre: string;
  supervisorApellido: string;
  estado: import("./enums").EstadoVenta;
  creadoEn: string | null;
}
