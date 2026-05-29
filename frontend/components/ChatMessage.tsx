"use client";

import { Message } from "@/hooks/useChatMessages";

export default function ChatMessage({ msg }: { msg: Message }) {
  const isUser = msg.who === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm transition-all ${
          isUser
            ? "rounded-br-md bg-linear-to-br from-indigo-600 to-blue-600 text-white dark:from-indigo-500 dark:to-blue-500"
            : "rounded-bl-md border border-neutral-200/80 bg-white text-neutral-800 dark:border-neutral-700/50 dark:bg-neutral-800/80 dark:text-neutral-100"
        }`}
      >
        {msg.text && (
          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
        )}

        {msg.image && (
          <div className="mt-2">
            {msg.image.caption && (
              <p className="mb-2 text-xs italic opacity-80">{msg.image.caption}</p>
            )}
            <img
              src={`data:${msg.image.mimeType};base64,${msg.image.base64}`}
              alt="Generada por Weme"
              className="w-full rounded-lg"
            />
          </div>
        )}

        {msg.mediaType === "image" && msg.mediaUrl && (
          <div className="mt-2">
            <img src={msg.mediaUrl} alt="Adjunto Weme" className="w-full rounded-lg" />
          </div>
        )}

        {(msg.audioUrl || msg.mediaType === "audio") && (
          <div className="mt-2">
            <audio
              controls
              className="w-full max-w-[220px] outline-none"
              src={msg.audioUrl || msg.mediaUrl}
            >
              Tu navegador no soporta audios.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}
