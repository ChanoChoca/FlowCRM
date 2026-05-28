"use server";

import { cookies } from "next/headers";
import {
  CreateTicketRequest,
  EstadoTicket,
  TicketResponse,
} from "@/types/tickets";

const API = process.env.NEXT_PUBLIC_API!;

async function authHeaders() {
  const jar = await cookies();
  const token = jar.get("token")?.value;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getTickets(): Promise<TicketResponse[]> {
  const res = await fetch(`${API}/tickets`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Error al obtener tickets");
  return res.json();
}

export async function getTicket(id: number): Promise<TicketResponse> {
  const res = await fetch(`${API}/tickets/${id}`, {
    headers: await authHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Ticket no encontrado");
  return res.json();
}

export async function crearTicket(data: CreateTicketRequest): Promise<TicketResponse> {
  const res = await fetch(`${API}/tickets`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear ticket");
  return res.json();
}

export async function cambiarEstadoTicket(
  id: number,
  estado: EstadoTicket
): Promise<TicketResponse> {
  const res = await fetch(`${API}/tickets/${id}/estado?estado=${estado}`, {
    method: "PATCH",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Error al cambiar estado");
  return res.json();
}

export async function responderTicket(
  id: number,
  contenido: string
): Promise<TicketResponse> {
  const res = await fetch(`${API}/tickets/${id}/mensajes`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ contenido }),
  });
  if (!res.ok) throw new Error("Error al responder ticket");
  return res.json();
}
