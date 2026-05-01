import { useEffect } from "react";

export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    async function acquire() {
      if (!("wakeLock" in navigator)) return;
      try {
        sentinel = await navigator.wakeLock.request("screen");
      } catch {
        // ignore; not supported / denied
      }
    }

    async function reacquireOnVisible() {
      if (!cancelled && document.visibilityState === "visible") {
        await acquire();
      }
    }

    void acquire();
    document.addEventListener("visibilitychange", reacquireOnVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", reacquireOnVisible);
      if (sentinel) {
        void sentinel.release().catch(() => {});
        sentinel = null;
      }
    };
  }, [active]);
}
