"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { useSessions } from "@/lib/queries/sessions";

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "高級",
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatMmSs(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return s === 0 ? `${m} 分` : `${m} 分 ${s} 秒`;
}

export default function HistoryPage() {
  const { data, isPending } = useSessions();

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        首頁
      </Link>
      <h1 className="text-2xl font-semibold">訓練紀錄</h1>

      {isPending && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg border bg-card animate-pulse" />
          ))}
        </div>
      )}

      {!isPending && (data?.length ?? 0) === 0 && (
        <p className="rounded-lg border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
          還沒有訓練紀錄。
        </p>
      )}

      {!isPending && (data?.length ?? 0) > 0 && (
        <ul className="space-y-2">
          {data!.map((s) => (
            <li key={s.sessionId}>
              <Link
                href={`/history/${s.sessionId}`}
                className="block rounded-lg border bg-card p-3 hover:bg-muted/30"
              >
                <p className="font-medium truncate">{s.workoutSnapshot.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{formatDate(s.startedAt)}</span>
                  <span>·</span>
                  <span>
                    {DIFFICULTY_LABEL[s.workoutSnapshot.difficulty] ??
                      s.workoutSnapshot.difficulty}
                  </span>
                  <span>·</span>
                  <span>{formatMmSs(s.totalElapsedMs)}</span>
                  {s.wasCompleted ? (
                    <span className="ml-auto text-emerald-600 dark:text-emerald-400">
                      完成
                    </span>
                  ) : (
                    <span className="ml-auto text-amber-600 dark:text-amber-400">
                      中斷
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
