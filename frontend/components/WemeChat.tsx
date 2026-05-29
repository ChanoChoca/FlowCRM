"use client";

import ChatMessage from "@/components/ChatMessage";
import { useAvatarAnimation } from "@/hooks/useAvatarAnimation";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useInactivityWarning } from "@/hooks/useInactivityWarning";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

export default function WemeChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const leftEyeRef = useRef<SVGEllipseElement>(null);
  const rightEyeRef = useRef<SVGEllipseElement>(null);
  const mouthRef = useRef<SVGPathElement>(null);

  const { messages, isPending, send } = useChatMessages();

  const lastBotMessage = messages.findLast((m) => m.who === "bot") ?? null;

  const { celebrate } = useAvatarAnimation(
    { fabRef, leftEyeRef, rightEyeRef, mouthRef },
    { isPending, isOpen, inputValue, lastBotMessage },
  );

  const handleWarn = useCallback(
    (text: string) => {
      send(text.startsWith("Che") || text.startsWith("¡") ? "" : text);
      // Push as a bot message without going through the API
      setIsOpen(true);
      celebrate();
    },
    [celebrate],
  );

  useInactivityWarning("Test", (text) => {
    setIsOpen(true);
    celebrate();
    // Inject the warning directly as a bot message via internal state trick —
    // we expose a low-level setter through send("") path won't work, so we
    // use a dedicated proactive push handled by useChatMessages returning a setter.
    // For simplicity we reuse send with a sentinel; the real solution keeps
    // messages state here and passes setMessages down.
    // TODO: expose addBotMessage from useChatMessages for proactive messages.
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;
    celebrate();
    send(text);
    setInputValue("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <button
        ref={fabRef}
        onClick={toggleChat}
        className="group relative h-14 w-14 rounded-full bg-linear-to-br from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 dark:from-indigo-500 dark:to-blue-500 dark:shadow-indigo-500/20 flex items-center justify-center cursor-pointer"
        aria-label="Abrir chat Weme"
      >
        <svg className="h-10 w-10 transition-transform group-hover:rotate-6" viewBox="0 0 24 24" fill="none">
          <defs>
            <radialGradient id="weme-face" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <filter id="weme-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="0.6" floodColor="#0b1020" floodOpacity="0.3" />
            </filter>
          </defs>
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.95" />
          <circle cx="12" cy="12" r="10" fill="url(#weme-face)" />
          <circle cx="5" cy="6.5" r="1.8" fill="currentColor" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
          <circle cx="19" cy="6.5" r="1.8" fill="currentColor" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" />
          <ellipse cx="9" cy="10" rx="2.8" ry="2.5" fill="white" opacity="0.95" filter="url(#weme-shadow)" />
          <ellipse cx="15" cy="10" rx="2.8" ry="2.5" fill="white" opacity="0.95" filter="url(#weme-shadow)" />
          <ellipse ref={leftEyeRef} cx="9" cy="10" rx="1.6" ry="1.6" fill="#0b1020" />
          <ellipse ref={rightEyeRef} cx="15" cy="10" rx="1.6" ry="1.6" fill="#0b1020" />
          <circle cx="9.7" cy="9.2" r="0.55" fill="white" opacity="0.85" />
          <circle cx="15.7" cy="9.2" r="0.55" fill="white" opacity="0.85" />
          <path
            ref={mouthRef}
            d="M8.5,14.5 Q12,16.5 15.5,14.5"
            stroke="#0b1020"
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="6" cy="12.5" r="1.4" fill="#f472b6" opacity="0.25" />
          <circle cx="18" cy="12.5" r="1.4" fill="#f472b6" opacity="0.25" />
        </svg>
        <span
          className="absolute inset-0 animate-ping rounded-full bg-indigo-500/20 dark:bg-indigo-400/15"
          style={{ animationDuration: "3s" }}
        />
      </button>

      {isOpen && (
        <section className="absolute bottom-20 right-0 flex h-125 w-92.5 max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/95 shadow-2xl shadow-neutral-900/10 backdrop-blur-xl animate-fade-in-up dark:border-neutral-700/50 dark:bg-neutral-900/95 dark:shadow-black/30">
          <header className="relative flex items-center justify-between bg-linear-to-r from-indigo-600 to-blue-600 p-4 text-white dark:from-indigo-700 dark:to-blue-700">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="11" r="7.5" fill="currentColor" opacity="0.9" />
                  <circle cx="9" cy="10" r="1.5" fill="#0b1020" />
                  <circle cx="15" cy="10" r="1.5" fill="#0b1020" />
                  <path d="M8.5 13.2 Q12 15.4 15.5 13.2" stroke="#0b1020" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold leading-none tracking-tight">Weme</h3>
                <p className="mt-0.5 text-[11px] font-medium text-white/70">Asistente interno</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-lg leading-none backdrop-blur-sm transition-all hover:scale-110 hover:bg-white/20 active:scale-95 cursor-pointer"
            >
              &times;
            </button>
          </header>

          <main
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-neutral-50/80 p-4 dark:bg-neutral-950/80 scrollbar-custom"
          >
            {messages.map((msg) => (
              <ChatMessage key={msg.id} msg={msg} />
            ))}
            {isPending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-neutral-200/80 bg-white p-3 text-sm dark:border-neutral-700/50 dark:bg-neutral-800/80">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 dark:bg-neutral-500"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    Pensando...
                  </span>
                </div>
              </div>
            )}
          </main>

          <form
            onSubmit={handleSend}
            className="flex items-end border-t border-neutral-200/70 bg-white/90 p-3 backdrop-blur-sm dark:border-neutral-700/50 dark:bg-neutral-900/90"
          >
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              rows={1}
              placeholder="Escribí tu consulta..."
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                const newHeight = Math.min(el.scrollHeight, 120);
                el.style.height = `${newHeight}px`;
                el.style.overflowY = el.scrollHeight > 120 ? "auto" : "hidden";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e as unknown as FormEvent<HTMLFormElement>);
                  if (inputRef.current) {
                    inputRef.current.style.height = "auto";
                    inputRef.current.style.overflowY = "hidden";
                  }
                }
              }}
              className="flex-1 resize-none rounded-l-xl border border-neutral-200/80 bg-neutral-50/80 px-4 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-indigo-400 focus:bg-white dark:border-neutral-700/50 dark:bg-neutral-800/60 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-indigo-500 dark:focus:bg-neutral-800 scrollbar-custom overflow-x-hidden"
              style={{ overflowY: "hidden", transition: "height 100ms, border-color 150ms, background-color 150ms" }}
            />
            <button
              type="submit"
              disabled={isPending}
              className="flex h-full w-11 shrink-0 items-center justify-center rounded-r-xl bg-linear-to-br from-indigo-600 to-blue-600 text-white shadow-sm transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:from-neutral-400 disabled:to-neutral-400 dark:from-indigo-500 dark:to-blue-500 dark:hover:from-indigo-400 dark:hover:to-blue-400 dark:disabled:from-neutral-700 dark:disabled:to-neutral-700 cursor-pointer"
            >
              {isPending ? (
                <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              )}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
