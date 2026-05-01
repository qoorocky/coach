"use client";

import { useEffect } from "react";
import { useSync } from "@/lib/queries/content";

export function AutoSync() {
  const sync = useSync();

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.onLine) {
      sync.mutate();
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
