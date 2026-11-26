"use client";

import { useEffect, useRef } from "react";
import { shouldPoll, shouldRefreshOnVisible } from "@/lib/polling";

/**
 * Calls `callback` every `intervalMs` while the tab is visible, never
 * overlapping runs, and catches up when the tab becomes visible again.
 * Does NOT run the callback on mount — callers keep their own initial load.
 * Pass `enabled=false` to pause.
 */
export function useVisiblePolling(
  callback: () => Promise<unknown> | unknown,
  intervalMs: number,
  enabled = true
) {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!enabled) return;
    let inFlight = false;
    let lastRunAt = Date.now();

    const run = async () => {
      inFlight = true;
      lastRunAt = Date.now();
      try {
        await callbackRef.current();
      } finally {
        inFlight = false;
      }
    };

    const tick = () => {
      if (shouldPoll({ hidden: document.hidden, inFlight })) void run();
    };

    const onVisibility = () => {
      if (!document.hidden && !inFlight && shouldRefreshOnVisible(Date.now(), lastRunAt, intervalMs)) {
        void run();
      }
    };

    const id = setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs, enabled]);
}
