"use server";
import { cookies } from "next/headers";

export interface BackendResponse {
  type?: string;
  reply?: string;
  mensajeIA?: string;
  messages?: string[];
  mediaType?: string;
  mediaUrl?: string;
  audioUrl?: string;
  imageBase64?: string;
  mimeType?: string;
}

// 1. ENVIAR MENSAJE (Ya no pide convId)
export async function sendMessage(text: string): Promise<BackendResponse> {
  const token = (await cookies()).get("token")?.value; // <-- CAMBIÁ "token" POR TU COOKIE REAL

  const response = await fetch(`${process.env.NEXT_PUBLIC_API}/chat/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message: text }), // Solo mandamos el mensaje
  });

  if (!response.ok) throw new Error("Error enviando mensaje al backend");
  return response.json();
}

// 2. BUSCAR HISTORIAL
export async function getChatHistory() {
  try {
    const token = (await cookies()).get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API}/chat/history`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Error del backend: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fallo al obtener historial desde Server Action:", error);
    return [];
  }
}
