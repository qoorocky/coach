"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useLastSync, useSync } from "@/lib/queries/content";

function formatRelative(ts: number | undefined): string {
  if (!ts) return "尚未同步";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "剛剛同步";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小時前`;
  return new Date(ts).toLocaleDateString("zh-Hant");
}

export function SyncStatus() {
  const lastSync = useLastSync();
  const sync = useSync();
  // Always initialize as `true` so server-rendered HTML matches the first
  // client paint; the real value is read on mount to avoid hydration mismatch.
  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    function update() {
      setOnline(navigator.onLine);
    }
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <div className="glass rounded-full pl-3 pr-1 py-1 flex items-center gap-2 text-[11px]">
      <span
        className={`size-1.5 rounded-full ${online ? "bg-emerald-400" : "bg-zinc-500"}`}
        aria-hidden
      />
      <span className="text-sub">
        {online ? "線上" : "離線"} ·{" "}
        {sync.isPending ? "同步中…" : formatRelative(lastSync.data)}
      </span>
      <button
        type="button"
        onClick={() => sync.mutate()}
        disabled={!online || sync.isPending}
        aria-label="立即同步"
        className="rounded-full p-1.5 hover:bg-white/5 disabled:opacity-40"
      >
        <RefreshCw
          className={`size-3.5 ${sync.isPending ? "animate-spin" : ""}`}
          color="var(--primary)"
        />
      </button>
    </div>
  );
}
