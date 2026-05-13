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
      </dl>

      <section className="space-y-2.5">
        <h2 className="text-xs font-medium text-dim">
          當時的段落 ({w.segments.length})
        </h2>
        <ol className="space-y-2.5">
          {w.segments.map((s, i) => (
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
              <p className="text-[11px] text-sub">
                {s.durationSec}s × {s.rounds} 回 · 休息 {s.restAfterSec}s
              </p>
            </li>
          ))}
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
