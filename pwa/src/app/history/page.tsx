"use client";

import Link from "next/link";
import { ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";

import { BottomNav } from "@/components/BottomNav";
import { CoachLogo } from "@/components/CoachLogo";
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
    <main className="mx-auto max-w-md px-5 pt-6 has-bottom-nav">
      <header className="flex items-center justify-between mb-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-sub hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          首頁
        </Link>
        <CoachLogo size={13} dim />
      </header>
      <h1 className="text-xl font-bold mb-1">訓練紀錄</h1>
      <p className="text-xs text-dim mb-5">
        {isPending ? "載入中…" : `${data?.length ?? 0} 筆紀錄`}
      </p>

      {isPending && (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass h-[68px] rounded animate-pulse" />
          ))}
        </div>
      )}

      {!isPending && (data?.length ?? 0) === 0 && (
        <p className="rounded border border-dashed border-border bg-card/40 p-6 text-center text-sm text-sub">
          還沒有訓練紀錄。
        </p>
      )}

      {!isPending && (data?.length ?? 0) > 0 && (
        <ul className="space-y-2.5">
          {data!.map((s) => (
            <li key={s.sessionId}>
              <Link
                href={`/history/${s.sessionId}`}
                className="glass block rounded p-3.5 active:scale-[0.99] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {s.workoutSnapshot.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-sub mt-1.5">
                      <span>{formatDate(s.startedAt)}</span>
                      <span className="text-dim">·</span>
                      <span>
                        {DIFFICULTY_LABEL[s.workoutSnapshot.difficulty] ??
                          s.workoutSnapshot.difficulty}
                      </span>
                      <span className="text-dim">·</span>
                      <span>{formatMmSs(s.totalElapsedMs)}</span>
                    </div>
                  </div>
                  {s.wasCompleted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-[3px] rounded-full badge-level-beginner">
                      <CheckCircle2 className="size-3" /> 完成
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-[3px] rounded-full badge-level-intermediate">
                      <AlertCircle className="size-3" /> 中斷
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <BottomNav />
    </main>
  );
}
