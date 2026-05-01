"use client";

import { useEffect, useState } from "react";
import { useLastSync, useSync } from "@/lib/queries/content";

function formatRelative(ts: number | undefined): string {
  if (!ts) return "尚未同步";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "剛剛同步";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分鐘前同步`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小時前同步`;
  return new Date(ts).toLocaleDateString("zh-Hant");
}

export function SyncStatus() {
  const lastSync = useLastSync();
  const sync = useSync();
  const [online, setOnline] = useState<boolean>(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    function update() {
      setOnline(navigator.onLine);
    }
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span
          className={`size-2 rounded-full ${
            online ? "bg-emerald-500" : "bg-zinc-400"
          }`}
          aria-hidden
        />
        <span>{online ? "線上" : "離線"}</span>
        <span>·</span>
        <span>
          {sync.isPending ? "同步中..." : formatRelative(lastSync.data)}
        </span>
      </div>
      <button
        type="button"
        onClick={() => sync.mutate()}
        disabled={!online || sync.isPending}
        className="rounded-md border border-border px-2.5 py-1 text-xs hover:bg-muted disabled:opacity-50"
      >
        立即同步
      </button>
    </div>
  );
}
