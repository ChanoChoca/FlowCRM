"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useEffect, useRef } from "react";

const MOUTH_SMILE = "M8.5,14.5 Q12,16.5 15.5,14.5";
const MOUTH_OPEN = "M9,14 Q12,17.5 15,14";
const MOUTH_TALK_A = "M9,14 Q12,16.8 15,14";
const MOUTH_TALK_B = "M9.5,14.5 Q12,15.2 14.5,14.5";
const MOUTH_HAPPY = "M8,14.2 Q12,17.5 16,14.2";
const MOUTH_FLAT = "M9,15 Q12,15 15,15";
const MOUTH_SAD = "M9,16.2 Q12,13.8 15,16.2";
const MOUTH_SMIRK = "M9,15 Q11,16.2 13.5,14.8";
const MOUTH_GRIN = "M7.5,14 Q12,18.2 16.5,14";

interface AvatarRefs {
  fabRef: React.RefObject<HTMLButtonElement | null>;
  leftEyeRef: React.RefObject<SVGEllipseElement | null>;
  rightEyeRef: React.RefObject<SVGEllipseElement | null>;
  mouthRef: React.RefObject<SVGPathElement | null>;
}

export function useAvatarAnimation(
  { fabRef, leftEyeRef, rightEyeRef, mouthRef }: AvatarRefs,
  {
    isPending,
    isOpen,
    inputValue,
    lastBotMessage,
  }: {
    isPending: boolean;
    isOpen: boolean;
    inputValue: string;
    lastBotMessage?: { text?: string; who: string } | null;
  },
) {
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const winkTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const isPendingRef = useRef(false);

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
        gsap.timeline()
          .to(mouthRef.current, { attr: { d: MOUTH_OPEN }, duration: 0.1 })
          .to(mouthRef.current, { attr: { d: MOUTH_SMILE }, duration: 0.2, ease: "power2.out" });
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
      if (!rightEyeRef.current || !leftEyeRef.current || !mouthRef.current) return;
      if (isPendingRef.current || isTypingRef.current) return;
      const tl = gsap.timeline();
      tl.to(rightEyeRef.current, { attr: { ry: 0.12 }, duration: 0.07 }).to(
        rightEyeRef.current,
        { attr: { ry: 1.6 }, duration: 0.14, ease: "bounce.out" },
      );
      gsap.to(mouthRef.current, { attr: { d: MOUTH_SMIRK }, duration: 0.1 });
      gsap.to(mouthRef.current, { attr: { d: MOUTH_SMILE }, duration: 0.25, delay: 0.45 });
    }),
    [],
  );

  const celebrate = useCallback(
    contextSafe!(() => {
      if (!leftEyeRef.current || !rightEyeRef.current || !mouthRef.current) return;
      gsap.to([leftEyeRef.current, rightEyeRef.current], { attr: { ry: 0.7 }, duration: 0.1 });
      gsap.to([leftEyeRef.current, rightEyeRef.current], {
        attr: { ry: 1.6 },
        duration: 0.18,
        delay: 0.12,
        ease: "bounce.out",
      });
      gsap.to(mouthRef.current, { attr: { d: MOUTH_GRIN }, duration: 0.12 });
      gsap.to(mouthRef.current, { attr: { d: MOUTH_SMILE }, duration: 0.3, delay: 0.55 });
    }),
    [],
  );

  // Auto wink
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

  // Pending state
  useEffect(() => {
    isPendingRef.current = isPending;
    if (!leftEyeRef.current || !rightEyeRef.current || !mouthRef.current) return;
    if (isPending) {
      gsap.to([leftEyeRef.current, rightEyeRef.current], {
        attr: { cx: (i: number) => (i === 0 ? 8 : 14), cy: 9.2, ry: 1.0 },
        duration: 0.35,
        overwrite: true,
      });
      gsap.to(mouthRef.current, { attr: { d: MOUTH_SMIRK }, duration: 0.25, overwrite: true });
    } else {
      gsap.to([leftEyeRef.current, rightEyeRef.current], {
        attr: { cx: (i: number) => (i === 0 ? 9 : 15), cy: 10, ry: 1.6 },
        duration: 0.35,
        overwrite: true,
      });
      gsap.to(mouthRef.current, { attr: { d: MOUTH_SMILE }, duration: 0.3, overwrite: true });
    }
  }, [isPending]);

  // Typing detection
  useEffect(() => {
    if (!inputValue || !leftEyeRef.current || !rightEyeRef.current || !mouthRef.current) return;
    isTypingRef.current = true;
    gsap.to([leftEyeRef.current, rightEyeRef.current], {
      attr: { cy: 11.5 },
      duration: 0.2,
      overwrite: true,
    });
    const talkShape = Math.random() > 0.5 ? MOUTH_TALK_A : MOUTH_TALK_B;
    gsap.to(mouthRef.current, { attr: { d: talkShape }, duration: 0.1, overwrite: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      if (leftEyeRef.current && rightEyeRef.current) {
        gsap.to([leftEyeRef.current, rightEyeRef.current], { attr: { cy: 10 }, duration: 0.3 });
      }
      if (mouthRef.current) {
        gsap.to(mouthRef.current, { attr: { d: MOUTH_SMILE }, duration: 0.3 });
      }
    }, 600);
  }, [inputValue]);

  // Open/close
  useEffect(() => {
    if (!leftEyeRef.current || !rightEyeRef.current || !mouthRef.current) return;
    if (isOpen) {
      const tl = gsap.timeline();
      tl.to([leftEyeRef.current, rightEyeRef.current], { attr: { r: 2.2 }, duration: 0.15 }).to(
        [leftEyeRef.current, rightEyeRef.current],
        { attr: { r: 1.6 }, duration: 0.2, ease: "elastic.out(1, 0.5)" },
      );
      gsap.to(mouthRef.current, { attr: { d: MOUTH_OPEN }, duration: 0.15 });
      gsap.to(mouthRef.current, { attr: { d: MOUTH_HAPPY }, duration: 0.25, delay: 0.3, ease: "power2.out" });
    } else {
      gsap.to(mouthRef.current, { attr: { d: MOUTH_FLAT }, duration: 0.15 });
      gsap.to(mouthRef.current, { attr: { d: MOUTH_SMILE }, duration: 0.3, delay: 0.5 });
    }
  }, [isOpen]);

  // React to new bot message
  useEffect(() => {
    if (!lastBotMessage || lastBotMessage.who !== "bot") return;
    if (!leftEyeRef.current || !rightEyeRef.current) return;
    const isError = lastBotMessage.text?.includes("No pude conectar");
    if (isError) {
      gsap.to([leftEyeRef.current, rightEyeRef.current], { attr: { cy: 10.7 }, duration: 0.25 });
      if (mouthRef.current) {
        gsap.to(mouthRef.current, { attr: { d: MOUTH_SAD }, duration: 0.2 });
        gsap.to(mouthRef.current, { attr: { d: MOUTH_SMILE }, duration: 0.4, delay: 2.5 });
      }
      gsap.to([leftEyeRef.current, rightEyeRef.current], { attr: { cy: 10 }, duration: 0.3, delay: 2.5 });
    } else {
      const tl = gsap.timeline();
      tl.to([leftEyeRef.current, rightEyeRef.current], { attr: { ry: 0.8 }, duration: 0.15 }).to(
        [leftEyeRef.current, rightEyeRef.current],
        { attr: { ry: 1.6 }, duration: 0.3, delay: 0.4, ease: "power2.out" },
      );
      if (mouthRef.current) {
        gsap.timeline()
          .to(mouthRef.current, { attr: { d: MOUTH_HAPPY }, duration: 0.2 })
          .to(mouthRef.current, { attr: { d: MOUTH_SMILE }, duration: 0.3, delay: 0.5, ease: "power2.out" });
      }
    }
  }, [lastBotMessage]);

  return { celebrate };
}
