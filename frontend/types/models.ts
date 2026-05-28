// AUTO-GENERATED — do not edit manually.
// Source: backend/src/main/java/com/flashpage/app/model/**/*.java
// Regenerate: node scripts/sync-types.mjs --force

import {
  AuditoriaHorario,
  Origen,
  Rol,
  TipoDocumento,
  TipoTarjeta,
} from "./enums";

export interface Archivo {
  id: number;
  nombre: string | null;
  url: string | null;
  tipo: string | null;
}

export interface Central {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface Cliente {
  id: number;
  nombre: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  telefono: string;
  email: string;
  domicilio: Domicilio;
  fotosDni?: Archivo[];
}

export interface Domicilio {
  id?: number;
  calle: string;
  numero: string;
  piso: string | null;
  depto: string | null;
  entreCalles1: string;
  entreCalles2: string;
  entreCalles3: string;
  observaciones: string | null;
  localidad: string;
  codigoPostal: string;
  provincia: Provincia | null;
}

export interface Pago {
  id: number;
  debitoAutomatico: boolean;
  tipoTarjeta: TipoTarjeta | null;
  banco: string;
  numeroTarjeta: string;
  titular: string;
}

export interface Producto {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface Promo {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface Provincia {
  id: number;
  nombre: string;
}

export interface Usuario {
  id: number;
  dni: string;
  password: string;
  rol: Rol | null;
  supervisor: Usuario | null;
  telefono: string | null;
  nombre: string;
  apellido: string;
  plazaUsername: string | null;
  plazaPassword: string | null;
  activo: boolean;
  rankingOptActivo: boolean;
  ultimoLogin: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface Venta {
  id: number;
  asesor: Usuario;
  cliente: Cliente;
  producto: Producto;
  promo: Promo;
  central: Central;
  ani: string;
  decos: number;
  referencia: string;
  contacto: AuditoriaHorario;
  pago: Pago;
  observaciones: string | null;
  origen: Origen | null;
  estado: import("./enums").EstadoVenta;
  creadoEn: string;
  actualizadoEn: string;
}

export type Decos = 0 | 1;
