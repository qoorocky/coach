"use client";

import Link from "next/link";
import { use } from "react";
import { ChevronLeft, Clock, Flame, ListOrdered } from "lucide-react";

import { useExercisesByIds, useWorkout } from "@/lib/queries/content";

interface Props {
  params: Promise<{ id: string }>;
}

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

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m} 分` : `${m} 分 ${s} 秒`;
}

export default function WorkoutDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data: workout, isPending } = useWorkout(id);
  const exerciseIds = workout?.segments.map((s) => s.exerciseId) ?? [];
  const { data: exerciseMap } = useExercisesByIds(exerciseIds);

  if (isPending) {
    return (
      <main className="mx-auto max-w-md px-5 py-6 space-y-3">
        <div className="h-5 w-24 rounded bg-muted animate-pulse" />
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-32 rounded bg-muted animate-pulse" />
      </main>
    );
  }

  if (!workout) {
    return (
      <main className="mx-auto max-w-md px-5 py-6 space-y-3">
        <Link
          href="/workouts"
          className="inline-flex items-center gap-1 text-sm text-sub hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          回列表
        </Link>
        <h1 className="text-xl font-semibold">找不到課程</h1>
        <p className="text-sm text-sub">此課程未在本機快取，請先同步。</p>
      </main>
    );
  }

  const badgeClass = DIFFICULTY_BADGE[workout.difficulty] ?? "";

  return (
    <main className="mx-auto max-w-md pb-10">
      {/* Hero */}
      <div
        className="relative h-[260px]"
        style={{
          background: workout.coverImageUrl
            ? `url(${workout.coverImageUrl}) center/cover`
            : "linear-gradient(135deg, #141416 0%, #1c1c1f 60%, #27272a 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "var(--primary-grad)", opacity: 0.12 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--hero-grad)" }}
        />
        <Link
          href="/workouts"
          aria-label="返回"
          className="absolute top-4 left-4 size-9 rounded-md flex items-center justify-center backdrop-blur-md"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <ChevronLeft className="size-5" color="#fff" />
        </Link>
        <div className="absolute right-5 top-1/2 -translate-y-1/2">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden>
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="var(--primary)"
              strokeWidth="1.5"
              opacity="0.3"
            />
            <circle
              cx="40"
              cy="40"
              r="24"
              stroke="var(--primary)"
              strokeWidth="2"
              opacity="0.5"
            />
            <circle cx="40" cy="40" r="12" fill="var(--primary)" opacity="0.85" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <div className="flex gap-2 mb-2.5">
            <span
              className="text-[11px] font-bold px-2.5 py-[3px] rounded-full text-white"
              style={{ background: "var(--primary-grad)" }}
            >
              {workout.mode.toUpperCase()}
            </span>
            <span
              className={`${badgeClass} text-[11px] px-2.5 py-[3px] rounded-full font-medium`}
            >
              {DIFFICULTY_LABEL[workout.difficulty] ?? workout.difficulty}
            </span>
          </div>
          <h1 className="text-[22px] font-extrabold text-white leading-tight">
            {workout.name}
          </h1>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-5 space-y-5">
        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: <Clock className="size-4" color="var(--primary)" />,
              value: formatDuration(workout.estimatedDurationSec),
              label: "時長",
            },
            {
              icon: <Flame className="size-4" color="var(--primary)" />,
              value: `${workout.estimatedCalories}`,
              label: "kcal",
            },
            {
              icon: <ListOrdered className="size-4" color="var(--primary)" />,
              value: `${workout.segments.length}`,
              label: "段落",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="glass rounded text-center py-3"
            >
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="text-[15px] font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-dim">{s.label}</p>
            </div>
          ))}
        </div>

        {workout.description && (
          <p className="text-[13px] text-sub leading-[1.8] whitespace-pre-wrap">
            {workout.description}
          </p>
        )}

        {workout.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {workout.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-3 py-[5px] rounded-full"
                style={{ background: "var(--pill)", color: "var(--sub)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/workouts/${workout.id}/play`}
          className="block w-full text-center rounded py-4 text-[15px] font-bold text-white shadow-lg"
          style={{ background: "var(--primary-grad)" }}
        >
          開始訓練
        </Link>

        <section className="space-y-2.5">
          <h2 className="text-xs font-medium text-dim">
            段落 ({workout.segments.length})
          </h2>
          <ol className="space-y-2.5">
            {workout.segments.map((s, i) => {
              const ex = exerciseMap?.get(s.exerciseId);
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
                    <p className="text-sm font-semibold truncate">
                      {ex?.name ?? "(動作不在快取)"}
                    </p>
                    <p className="text-[11px] text-sub mt-0.5">
                      {s.durationSec}s × {s.rounds} 回 · 休息 {s.restAfterSec}s
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </main>
  );
}
