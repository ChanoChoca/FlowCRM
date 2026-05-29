"use client";

import {
  BackendResponse,
  getChatHistory,
  sendMessage,
} from "@/app/actions/chat";
import { useEffect, useState, useTransition } from "react";

export interface Message {
  id: string;
  text?: string;
  who: "bot" | "user";
  image?: { base64: string; mimeType: string; caption?: string };
  mediaType?: "image" | "audio" | "video" | "document" | string;
  mediaUrl?: string;
  audioUrl?: string;
}

const INITIAL_MESSAGE: Message = {
  id: "initial",
  who: "bot",
  text: "Hola 👋 Soy Weme. Decime qué necesitás (precios, estados, errores, cierres).",
};

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (hasFetchedHistory) return;

    const loadHistory = async () => {
      try {
        const historyData = await getChatHistory();
        if (Array.isArray(historyData) && historyData.length > 0) {
          const formatted = historyData
            .map((msg: any) => ({
              id: msg.id?.toString() || crypto.randomUUID(),
              who: msg.who || "bot",
              text: msg.text || msg.content || msg.mensajeIA,
              mediaType: msg.mediaType,
              mediaUrl: msg.mediaUrl,
              audioUrl: msg.audioUrl,
            }))
            .reverse();
          setMessages([
            ...formatted,
            {
              id: "initial",
              who: "bot",
              text: "¡Holaa, estoy de nuevo! 👋 ¿En qué te ayudo hoy?",
            },
          ]);
        }
      } catch (error) {
        console.error("Error cargando el historial de Weme:", error);
      } finally {
        setHasFetchedHistory(true);
      }
    };

    startTransition(() => {
      loadHistory();
    });
  }, [hasFetchedHistory]);

  function send(text: string, onSent?: () => void) {
    const userMsg: Message = { id: crypto.randomUUID(), who: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    onSent?.();

    startTransition(async () => {
      try {
        const data: BackendResponse = await sendMessage(text);

        if (data.type === "multi") {
          const botMsgs: Message[] = (data.messages || [])
            .filter((m) => (m ?? "").trim().length > 0)
            .map((m) => ({ id: crypto.randomUUID(), who: "bot", text: m }));
          setMessages((prev) => [...prev, ...botMsgs]);
          return;
        }

        const botMsg: Message = {
          id: crypto.randomUUID(),
          who: "bot",
          text:
            data.type === "image"
              ? undefined
              : data.reply || data.mensajeIA || "OK",
          mediaType: data.mediaType,
          mediaUrl: data.mediaUrl,
          audioUrl: data.audioUrl,
          image:
            data.type === "image" && data.imageBase64
              ? {
                  base64: data.imageBase64,
                  mimeType: data.mimeType || "image/png",
                  caption: data.reply,
                }
              : undefined,
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            who: "bot",
            text: "No pude conectar con el servidor. ¿Está el backend activo?",
          },
        ]);
      }
    });
  }

  return { messages, isPending, send };
}
