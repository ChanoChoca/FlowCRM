"use client";

import { useEffect } from "react";

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  description: string;
  handler: () => void;
  /** Skip when focus is inside an input/textarea/select */
  ignoreWhenTyping?: boolean;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (!e.isTrusted) return;
      if (!e.key || e.key === "Unidentified" || e.isComposing) return;
      const eventKey = e.key.toLowerCase();

      for (const shortcut of shortcuts) {
        if (shortcut.ignoreWhenTyping && typing) continue;
        if (!shortcut.key || shortcut.key.toLowerCase() !== eventKey) continue;
        if (shortcut.ctrl !== undefined && shortcut.ctrl !== (e.ctrlKey || e.metaKey)) continue;
        if (shortcut.shift !== undefined && shortcut.shift !== e.shiftKey) continue;

        e.preventDefault();
        shortcut.handler();
        return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcuts]);
}
