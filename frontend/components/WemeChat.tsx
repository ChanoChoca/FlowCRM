"use client";

import {
  BackendResponse,
  getChatHistory,
  sendMessage,
} from "@/app/actions/chat";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

gsap.registerPlugin(useGSAP);

interface Message {
  id: string;
  text?: string;
  who: "bot" | "user";
  image?: {
    base64: string;
    mimeType: string;
    caption?: string;
  };
  mediaType?: "image" | "audio" | "video" | "document" | string;
  mediaUrl?: string;
  audioUrl?: string;
}

export default function WemeChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      who: "bot",
      text: "Hola 👋 Soy Weme. Decime qué necesitás (precios, estados, errores, cierres).",
    },
  ]);
  const [hasFetchedHistory, setHasFetchedHistory] = useState(false);
  const [isPending, startTransition] = useTransition();

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const leftEyeRef = useRef<SVGEllipseElement>(null);
  const rightEyeRef = useRef<SVGEllipseElement>(null);
  const mouthRef = useRef<SVGPathElement>(null);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const winkTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const isPendingRef = useRef(false);

  // --- VARIABLES PARA EL VIGILANTE DE INACTIVIDAD ---
  const userName = "Test";
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const warningLevelRef = useRef<0 | 1 | 2>(0);

  // Mouth path constants
  const MOUTH_SMILE = "M8.5,14.5 Q12,16.5 15.5,14.5";
  const MOUTH_OPEN = "M9,14 Q12,17.5 15,14";
  const MOUTH_TALK_A = "M9,14 Q12,16.8 15,14";
  const MOUTH_TALK_B = "M9.5,14.5 Q12,15.2 14.5,14.5";
  const MOUTH_HAPPY = "M8,14.2 Q12,17.5 16,14.2";
  const MOUTH_FLAT = "M9,15 Q12,15 15,15";
  const MOUTH_SAD = "M9,16.2 Q12,13.8 15,16.2";
  const MOUTH_SMIRK = "M9,15 Q11,16.2 13.5,14.8";
  const MOUTH_GRIN = "M7.5,14 Q12,18.2 16.5,14";

  const { contextSafe } = useGSAP(() => {}, { scope: fabRef });

  const onMouseMove = useCallback(
    contextSafe!((e: MouseEvent) => {
      if (!fabRef.current || !leftEyeRef.current || !rightEyeRef.current)
        return;
      if (isTypingRef.current || isPendingRef.current) return;

      const rect = fabRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxOffset = 1.8;
      const factor = Math.min(dist / 200, 1) * maxOffset;
      const angle = Math.atan2(dy, dx);
      const ox = Math.cos(angle) * factor;
      const oy = Math.sin(angle) * factor;

      gsap.to([leftEyeRef.current, rightEyeRef.current], {
        attr: { cx: (i: number) => (i === 0 ? 9 : 15) + ox, cy: 10 + oy },
        duration: 0.15,
        overwrite: true,
      });
    }),
    [],
  );

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  const blink = useCallback(
    contextSafe!(() => {
      if (!leftEyeRef.current || !rightEyeRef.current) return;
      const tl = gsap.timeline();
      tl.to([leftEyeRef.current, rightEyeRef.current], {
        attr: { ry: 0.2 },
        duration: 0.08,
      }).to([leftEyeRef.current, rightEyeRef.current], {
        attr: { ry: 1.6 },
        duration: 0.08,
      });
      if (mouthRef.current) {
        const tlm = gsap.timeline();
        tlm
          .to(mouthRef.current, { attr: { d: MOUTH_OPEN }, duration: 0.1 })
          .to(mouthRef.current, {
            attr: { d: MOUTH_SMILE },
            duration: 0.2,
            ease: "power2.out",
          });
      }
    }),
    [],
  );

  useEffect(() => {
    window.addEventListener("click", blink);
    return () => window.removeEventListener("click", blink);
  }, [blink]);

  const wink = useCallback(
    contextSafe!(() => {
      if (!rightEyeRef.current || !leftEyeRef.current || !mouthRef.current)
        return;
      if (isPendingRef.current || isTypingRef.current) return;
      const tl = gsap.timeline();
      tl.to(rightEyeRef.current, { attr: { ry: 0.12 }, duration: 0.07 }).to(
        rightEyeRef.current,
        { attr: { ry: 1.6 }, duration: 0.14, ease: "bounce.out" },
      );
      gsap.to(mouthRef.current, { attr: { d: MOUTH_SMIRK }, duration: 0.1 });
      gsap.to(mouthRef.current, {
        attr: { d: MOUTH_SMILE },
        duration: 0.25,
        delay: 0.45,
      });
    }),
    [],
  );

  const celebrate = useCallback(
    contextSafe!(() => {
      if (!leftEyeRef.current || !rightEyeRef.current || !mouthRef.current)
        return;
      gsap.to([leftEyeRef.current, rightEyeRef.current], {
        attr: { ry: 0.7 },
        duration: 0.1,
      });
      gsap.to([leftEyeRef.current, rightEyeRef.current], {
        attr: { ry: 1.6 },
        duration: 0.18,
        delay: 0.12,
        ease: "bounce.out",
      });
      gsap.to(mouthRef.current, { attr: { d: MOUTH_GRIN }, duration: 0.12 });
      gsap.to(mouthRef.current, {
        attr: { d: MOUTH_SMILE },
        duration: 0.3,
        delay: 0.55,
      });
    }),
    [],
  );

  useEffect(() => {
    const schedule = (): ReturnType<typeof setTimeout> => {
      const delay = 5000 + Math.random() * 7000;
      return setTimeout(() => {
        wink();
        winkTimerRef.current = schedule();
      }, delay);
    };
    winkTimerRef.current = schedule();
    return () => {
      if (winkTimerRef.current) clearTimeout(winkTimerRef.current);
    };
  }, [wink]);

  useEffect(() => {
    isPendingRef.current = isPending;
    if (!leftEyeRef.current || !rightEyeRef.current || !mouthRef.current)
      return;
    if (isPending) {
      gsap.to([leftEyeRef.current, rightEyeRef.current], {
        attr: { cx: (i: number) => (i === 0 ? 8 : 14), cy: 9.2, ry: 1.0 },
        duration: 0.35,
        overwrite: true,
      });
      gsap.to(mouthRef.current, {
        attr: { d: MOUTH_SMIRK },
        duration: 0.25,
        overwrite: true,
      });
    } else {
      gsap.to([leftEyeRef.current, rightEyeRef.current], {
        attr: { cx: (i: number) => (i === 0 ? 9 : 15), cy: 10, ry: 1.6 },
        duration: 0.35,
        overwrite: true,
      });
      gsap.to(mouthRef.current, {
        attr: { d: MOUTH_SMILE },
        duration: 0.3,
        overwrite: true,
      });
    }
  }, [isPending]);

  useEffect(() => {
    if (
      !inputValue ||
      !leftEyeRef.current ||
      !rightEyeRef.current ||
      !mouthRef.current
    )
      return;

    isTypingRef.current = true;
    gsap.to([leftEyeRef.current, rightEyeRef.current], {
      attr: { cy: 11.5 },
      duration: 0.2,
      overwrite: true,
    });
    const talkShape = Math.random() > 0.5 ? MOUTH_TALK_A : MOUTH_TALK_B;
    gsap.to(mouthRef.current, {
      attr: { d: talkShape },
      duration: 0.1,
      overwrite: true,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      if (leftEyeRef.current && rightEyeRef.current) {
        gsap.to([leftEyeRef.current, rightEyeRef.current], {
          attr: { cy: 10 },
          duration: 0.3,
        });
      }
      if (mouthRef.current) {
        gsap.to(mouthRef.current, {
          attr: { d: MOUTH_SMILE },
          duration: 0.3,
        });
      }
    }, 600);
  }, [inputValue]);

  useEffect(() => {
    if (!leftEyeRef.current || !rightEyeRef.current || !mouthRef.current)
      return;
    if (isOpen) {
      const tl = gsap.timeline();
      tl.to([leftEyeRef.current, rightEyeRef.current], {
        attr: { r: 2.2 },
        duration: 0.15,
      }).to([leftEyeRef.current, rightEyeRef.current], {
        attr: { r: 1.6 },
        duration: 0.2,
        ease: "elastic.out(1, 0.5)",
      });
      gsap.to(mouthRef.current, { attr: { d: MOUTH_OPEN }, duration: 0.15 });
      gsap.to(mouthRef.current, {
        attr: { d: MOUTH_HAPPY },
        duration: 0.25,
        delay: 0.3,
        ease: "power2.out",
      });
    } else {
      gsap.to(mouthRef.current, { attr: { d: MOUTH_FLAT }, duration: 0.15 });
      gsap.to(mouthRef.current, {
        attr: { d: MOUTH_SMILE },
        duration: 0.3,
        delay: 0.5,
      });
    }
  }, [isOpen]);

  const prevMsgCount = useRef(messages.length);
  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      const last = messages[messages.length - 1];
      if (last.who === "bot" && leftEyeRef.current && rightEyeRef.current) {
        const isError = last.text?.includes("No pude conectar");
        if (isError) {
          gsap.to([leftEyeRef.current, rightEyeRef.current], {
            attr: { cy: 10.7 },
            duration: 0.25,
          });
          if (mouthRef.current) {
            gsap.to(mouthRef.current, {
              attr: { d: MOUTH_SAD },
              duration: 0.2,
            });
            gsap.to(mouthRef.current, {
              attr: { d: MOUTH_SMILE },
              duration: 0.4,
              delay: 2.5,
            });
          }
          gsap.to([leftEyeRef.current, rightEyeRef.current], {
            attr: { cy: 10 },
            duration: 0.3,
            delay: 2.5,
          });
        } else {
          const tl = gsap.timeline();
          tl.to([leftEyeRef.current, rightEyeRef.current], {
            attr: { ry: 0.8 },
            duration: 0.15,
          }).to([leftEyeRef.current, rightEyeRef.current], {
            attr: { ry: 1.6 },
            duration: 0.3,
            delay: 0.4,
            ease: "power2.out",
          });
          if (mouthRef.current) {
            const tlm = gsap.timeline();
            tlm
              .to(mouthRef.current, { attr: { d: MOUTH_HAPPY }, duration: 0.2 })
              .to(mouthRef.current, {
                attr: { d: MOUTH_SMILE },
                duration: 0.3,
                delay: 0.5,
                ease: "power2.out",
              });
          }
        }
      }
    }
    prevMsgCount.current = messages.length;
  }, [messages]);

  // FETCH DEL HISTORIAL (PRE-CARGA INVISIBLE Y ORDENADO)
  useEffect(() => {
    if (hasFetchedHistory) return;

    const loadHistory = async () => {
      try {
        const historyData = await getChatHistory();

        if (
          historyData &&
          Array.isArray(historyData) &&
          historyData.length > 0
        ) {
          const formattedHistory = historyData
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
            ...formattedHistory,
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

  // --- EL NUEVO VIGILANTE DE INACTIVIDAD (ANTI-BUCLES) ---
  useEffect(() => {
    // Tiempos reales (Cambialos por 5000 y 10000 para probar de nuevo)
    const TIME_1_HOUR = 60 * 60 * 1000;
    const TIME_HALF_HOUR = 30 * 60 * 1000;

    // Escudo para eventos automáticos
    let lastWarningTime = 0;

    const triggerWemeProactive = (text: string) => {
      lastWarningTime = Date.now(); // Guardamos la hora exacta del aviso

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          who: "bot",
          text: text,
        },
      ]);
      setIsOpen(true);
      celebrate();
    };

    const checkInactivity = () => {
      if (warningLevelRef.current === 0) {
        warningLevelRef.current = 1;
        triggerWemeProactive(
          `Che ${userName}, vi que estuviste inactivo un buen rato. Acordate que por seguridad y para ahorrar ancho de banda, la sesión se cerrará a las 2 horas.`,
        );
        // Seteamos la alarma para la media hora restante
        inactivityTimerRef.current = setTimeout(
          checkInactivity,
          TIME_HALF_HOUR,
        );
      } else if (warningLevelRef.current === 1) {
        warningLevelRef.current = 2;
        triggerWemeProactive(
          `¡Atención ${userName}! Te queda solo media hora antes de que se cierre la sesión. Guardá tus ventas si estás a la mitad de algo.`,
        );
      }
    };

    const resetTimer = (e?: Event) => {
      // 1. Si el evento fue generado por un script y no por un humano, lo ignoramos
      if (e && !e.isTrusted) return;

      // 2. ESCUDO: Si Weme acaba de saltar hace menos de 3 segundos, ignoramos
      // los "movimientos" causados por la animación de la ventana abriéndose.
      if (Date.now() - lastWarningTime < 3000) return;

      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      warningLevelRef.current = 0; // Perdonamos la inactividad
      inactivityTimerRef.current = setTimeout(checkInactivity, TIME_1_HOUR);
    };

    // Sacamos "scroll" porque el autoscroll de los mensajes nuevos rompía todo
    const events = ["mousemove", "keydown", "click", "touchstart"];

    // Usamos 'as EventListener' para que TypeScript no se queje
    events.forEach((event) =>
      window.addEventListener(event, resetTimer as EventListener),
    );

    resetTimer(); // Disparamos el reloj por primera vez

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer as EventListener),
      );
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [celebrate, userName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text) return;

    const userMsg: Message = { id: crypto.randomUUID(), who: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    celebrate();

    startTransition(async () => {
      try {
        const data: BackendResponse = await sendMessage(text);

        if (data.type === "multi") {
          const botMsgs: Message[] = (data.messages || [])
            .filter((m) => (m ?? "").trim().length > 0)
            .map((m) => ({
              id: crypto.randomUUID(),
              who: "bot",
              text: m,
            }));

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
      } catch (error) {
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
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <button
        ref={fabRef}
        onClick={toggleChat}
        className="group relative h-14 w-14 rounded-full bg-linear-to-br from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 dark:from-indigo-500 dark:to-blue-500 dark:shadow-indigo-500/20 flex items-center justify-center cursor-pointer"
        aria-label="Abrir chat Weme"
      >
        <svg
          className="h-10 w-10 transition-transform group-hover:rotate-6"
          viewBox="0 0 24 24"
          fill="none"
        >
          <defs>
            <radialGradient id="weme-face" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>
            <filter
              id="weme-shadow"
              x="-10%"
              y="-10%"
              width="120%"
              height="120%"
            >
              <feDropShadow
                dx="0"
                dy="1"
                stdDeviation="0.6"
                floodColor="#0b1020"
                floodOpacity="0.3"
              />
            </filter>
          </defs>
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.95" />
          <circle cx="12" cy="12" r="10" fill="url(#weme-face)" />
          <circle
            cx="5"
            cy="6.5"
            r="1.8"
            fill="currentColor"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.4"
          />
          <circle
            cx="19"
            cy="6.5"
            r="1.8"
            fill="currentColor"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.4"
          />
          <ellipse
            cx="9"
            cy="10"
            rx="2.8"
            ry="2.5"
            fill="white"
            opacity="0.95"
            filter="url(#weme-shadow)"
          />
          <ellipse
            cx="15"
            cy="10"
            rx="2.8"
            ry="2.5"
            fill="white"
            opacity="0.95"
            filter="url(#weme-shadow)"
          />
          <ellipse
            ref={leftEyeRef}
            cx="9"
            cy="10"
            rx="1.6"
            ry="1.6"
            fill="#0b1020"
          />
          <ellipse
            ref={rightEyeRef}
            cx="15"
            cy="10"
            rx="1.6"
            ry="1.6"
            fill="#0b1020"
          />
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
        <section className="absolute bottom-20 right-0 flex h-[500px] w-[370px] max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/95 shadow-2xl shadow-neutral-900/10 backdrop-blur-xl animate-fade-in-up dark:border-neutral-700/50 dark:bg-neutral-900/95 dark:shadow-black/30">
          <header className="relative flex items-center justify-between bg-linear-to-r from-indigo-600 to-blue-600 p-4 text-white dark:from-indigo-700 dark:to-blue-700">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <svg
                  className="h-7 w-7 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="11"
                    r="7.5"
                    fill="currentColor"
                    opacity="0.9"
                  />
                  <circle cx="9" cy="10" r="1.5" fill="#0b1020" />
                  <circle cx="15" cy="10" r="1.5" fill="#0b1020" />
                  <path
                    d="M8.5 13.2 Q12 15.4 15.5 13.2"
                    stroke="#0b1020"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold leading-none tracking-tight">
                  Weme
                </h3>
                <p className="mt-0.5 text-[11px] font-medium text-white/70">
                  Asistente interno
                </p>
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
              <div
                key={msg.id}
                className={`flex ${msg.who === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm transition-all ${
                    msg.who === "user"
                      ? "rounded-br-md bg-linear-to-br from-indigo-600 to-blue-600 text-white dark:from-indigo-500 dark:to-blue-500"
                      : "rounded-bl-md border border-neutral-200/80 bg-white text-neutral-800 dark:border-neutral-700/50 dark:bg-neutral-800/80 dark:text-neutral-100"
                  }`}
                >
                  {/* TEXTO */}
                  {msg.text && (
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {msg.text}
                    </p>
                  )}

                  {/* IMÁGENES BASE64 (LEGACY) */}
                  {msg.image && (
                    <div className="mt-2">
                      {msg.image.caption && (
                        <p className="mb-2 text-xs italic opacity-80">
                          {msg.image.caption}
                        </p>
                      )}
                      <img
                        src={`data:${msg.image.mimeType};base64,${msg.image.base64}`}
                        alt="Generada por Weme"
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}

                  {/* IMÁGENES URL (NUEVO) */}
                  {msg.mediaType === "image" && msg.mediaUrl && (
                    <div className="mt-2">
                      <img
                        src={msg.mediaUrl}
                        alt="Adjunto Weme"
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}

                  {/* AUDIOS (NUEVO) */}
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
            ))}
            {isPending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-neutral-200/80 bg-white p-3 text-sm dark:border-neutral-700/50 dark:bg-neutral-800/80">
                  <div className="flex gap-1">
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 dark:bg-neutral-500"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 dark:bg-neutral-500"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 dark:bg-neutral-500"
                      style={{ animationDelay: "300ms" }}
                    />
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
              className="flex-1 resize-none rounded-l-xl border border-neutral-200/80 bg-neutral-50/80 px-4 py-2.5 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-indigo-400 focus:bg-white dark:border-neutral-700/50 dark:bg-neutral-800/60 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-indigo-500 dark:focus:bg-neutral-800 scrollbar-custom overflow-x-hidden transition-[height] duration-100"
              style={{ overflowY: "hidden" }}
            />
            <button
              type="submit"
              disabled={isPending}
              className="flex h-full w-11 shrink-0 items-center justify-center rounded-r-xl bg-linear-to-br from-indigo-600 to-blue-600 text-white shadow-sm transition-all hover:from-indigo-700 hover:to-blue-700 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:from-neutral-400 disabled:to-neutral-400 dark:from-indigo-500 dark:to-blue-500 dark:hover:from-indigo-400 dark:hover:to-blue-400 dark:disabled:from-neutral-700 dark:disabled:to-neutral-700 cursor-pointer"
            >
              {isPending ? (
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4.5 w-4.5"
                >
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
