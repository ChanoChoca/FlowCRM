"use client";

import { useMemo } from "react";

export function usePlatform() {
  const isMac = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? navigator.userAgent);
  }, []);

  return {
    isMac,
    modKey: isMac ? "⌘" : "Ctrl",
    modLabel: isMac ? "⌘K" : "Ctrl+K",
  };
}
