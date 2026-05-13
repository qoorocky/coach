"use client";

import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";

import { useDeleteSession, useSession } from "@/lib/queries/sessions";

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "高級",
};

const DIFFICULTY_BADGE: Record<string, string> = {
  beginner: "badge-level-beginner",
  intermediate: "badge-level-intermediate",
  advanced: "badge-level-advanced",
};

function formatDateTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString("zh-Hant");
}

function formatMmSs(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function SessionDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, isPending } = useSession(id);
  const del = useDeleteSession();

  if (isPending) {
    return (
      <main className="mx-auto max-w-md px-5 py-6 space-y-3">
        <div className="h-6 w-24 rounded bg-muted animate-pulse" />
        <div className="h-32 rounded bg-muted animate-pulse" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="mx-auto max-w-md px-5 py-6 space-y-3">
        <Link
          href="/history"
          className="inline-flex items-center gap-1 text-sm text-sub hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          回紀錄
        </Link>
        <h1 className="text-xl font-semibold">找不到紀錄</h1>
      </main>
    );
  }

  const w = session.workoutSnapshot;
  const badgeClass = DIFFICULTY_BADGE[w.difficulty] ?? "";

  // Map completedSegments by segmentId for inline lookup against the workout snapshot.
  const completedById = new Map(
    (session.completedSegments ?? []).map((c) => [c.segmentId, c]),
  );
  const RATING_EMOJI = ["", "😣", "😐", "😊", "🤩"] as const;
  const RATING_LABEL = ["", "勉強", "尚可", "不錯", "爽"] as const;

  return (
    <main className="mx-auto max-w-md px-5 pt-6 pb-10 space-y-5">
      <Link
        href="/history"
        className="inline-flex items-center gap-1 text-sm text-sub hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        回紀錄
      </Link>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{w.name}</h1>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`${badgeClass} text-[11px] px-2.5 py-[3px] rounded-full font-medium`}
          >
            {DIFFICULTY_LABEL[w.difficulty] ?? w.difficulty}
          </span>
          <span className="text-sub">·</span>
          <span className="text-sub">{w.segments.length} 段落</span>
        </div>
      </header>

      <dl className="grid grid-cols-2 gap-px rounded overflow-hidden bg-border">
        <Stat label="開始時間" value={formatDateTime(session.startedAt)} />
        <Stat
          label="結束時間"
          value={session.endedAt ? formatDateTime(session.endedAt) : "—"}
        />
        <Stat label="實際時長" value={formatMmSs(session.totalElapsedMs)} accent />
        <Stat
          label="狀態"
          value={session.wasCompleted ? "完成" : "中斷"}
          accent
        />
        {session.avgHeartRate != null && (
          <Stat label="平均心率" value={`${session.avgHeartRate} bpm`} />
        )}
        {session.maxHeartRate != null && (
          <Stat label="最高心率" value={`${session.maxHeartRate} bpm`} accent />
        )}
        {session.subjectiveRating != null && (
          <Stat
            label="主觀評分"
            value={`${RATING_EMOJI[session.subjectiveRating]} ${RATING_LABEL[session.subjectiveRating]}`}
          />
        )}
      </dl>

      <section className="space-y-2.5">
        <h2 className="text-xs font-medium text-dim">
          當時的段落 ({w.segments.length})
        </h2>
        <ol className="space-y-2.5">
          {w.segments.map((s, i) => {
            const done = completedById.get(s.segmentId);
            const plannedSec = s.durationSec * Math.max(1, s.rounds);
            return (
              <li
                key={s.segmentId}
                className="glass rounded p-3.5 flex items-center gap-3.5"
              >
                <span
                  className="size-7 shrink-0 rounded-full text-center text-xs leading-7 font-bold"
                  style={{
                    background: "var(--primary-dim)",
                    color: "var(--primary)",
                  }}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-sub">
                    計畫：{s.durationSec}s × {s.rounds} 回 · 休息 {s.restAfterSec}s
                  </p>
                  {done && (
                    <p className="text-[11px] mt-0.5">
                      <span className="text-dim">實際：</span>
                      <span className="font-semibold tabular-nums">
                        {formatMmSs(done.actualDurationMs)}
                      </span>
                      <span className="text-dim">
                        {" "}
                        / {formatMmSs(plannedSec * 1000)}
                      </span>
                      {done.wasSkipped && (
                        <span className="ml-2 text-[10px] px-1.5 py-px rounded bg-amber-500/20 text-amber-400">
                          有跳過
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <button
        type="button"
        onClick={() => {
          if (!confirm("確定刪除此筆紀錄？")) return;
          del.mutate(session.sessionId, {
            onSuccess: () => router.push("/history"),
          });
        }}
        disabled={del.isPending}
        className="inline-flex items-center gap-1.5 text-sm text-destructive hover:underline disabled:opacity-50"
      >
        <Trash2 className="size-4" />
        刪除紀錄
      </button>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="px-4 py-3"
      style={{ background: "var(--card)" }}
    >
      <dt className="text-[11px] text-dim mb-0.5">{label}</dt>
      <dd
        className="text-sm font-semibold"
        style={accent ? { color: "var(--primary)" } : undefined}
      >
        {value}
      </dd>
    </div>
  );
}
