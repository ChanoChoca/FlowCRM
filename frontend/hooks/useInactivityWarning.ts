"use client";

import { useEffect, useRef } from "react";

const TIME_1_HOUR = 60 * 60 * 1000;
const TIME_HALF_HOUR = 30 * 60 * 1000;

export function useInactivityWarning(
  userName: string,
  onWarn: (text: string) => void,
) {
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const warningLevelRef = useRef<0 | 1 | 2>(0);

  useEffect(() => {
    let lastWarningTime = 0;

    const triggerWemeProactive = (text: string) => {
      lastWarningTime = Date.now();
      onWarn(text);
    };

    const checkInactivity = () => {
      if (warningLevelRef.current === 0) {
        warningLevelRef.current = 1;
        triggerWemeProactive(
          `Che ${userName}, vi que estuviste inactivo un buen rato. Acordate que por seguridad y para ahorrar ancho de banda, la sesión se cerrará a las 2 horas.`,
        );
        inactivityTimerRef.current = setTimeout(checkInactivity, TIME_HALF_HOUR);
      } else if (warningLevelRef.current === 1) {
        warningLevelRef.current = 2;
        triggerWemeProactive(
          `¡Atención ${userName}! Te queda solo media hora antes de que se cierre la sesión. Guardá tus ventas si estás a la mitad de algo.`,
        );
      }
    };

    const resetTimer = (e?: Event) => {
      if (e && !e.isTrusted) return;
      if (Date.now() - lastWarningTime < 3000) return;
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      warningLevelRef.current = 0;
      inactivityTimerRef.current = setTimeout(checkInactivity, TIME_1_HOUR);
    };

    const events = ["mousemove", "keydown", "click", "touchstart"];
    events.forEach((event) =>
      window.addEventListener(event, resetTimer as EventListener),
    );
    resetTimer();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer as EventListener),
      );
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [userName, onWarn]);
}
