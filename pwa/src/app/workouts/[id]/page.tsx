"use client";

import Link from "next/link";
import { use } from "react";
import { ChevronLeft } from "lucide-react";

import { useExercisesByIds, useWorkout } from "@/lib/queries/content";

interface Props {
  params: Promise<{ id: string }>;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "高級",
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
      <main className="mx-auto max-w-md px-4 py-6 space-y-3">
        <div className="h-5 w-24 rounded bg-muted animate-pulse" />
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-32 rounded-lg bg-muted animate-pulse" />
      </main>
    );
  }

  if (!workout) {
    return (
      <main className="mx-auto max-w-md px-4 py-6 space-y-3">
        <Link
          href="/workouts"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          回列表
        </Link>
        <h1 className="text-xl font-semibold">找不到課程</h1>
        <p className="text-sm text-muted-foreground">此課程未在本機快取，請先同步。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-6 space-y-5">
      <Link
        href="/workouts"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        回列表
      </Link>

      {workout.coverImageUrl && (
        <img
          src={workout.coverImageUrl}
          alt={workout.name}
          className="aspect-video w-full rounded-lg border bg-muted object-cover"
        />
      )}

      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{workout.name}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{DIFFICULTY_LABEL[workout.difficulty] ?? workout.difficulty}</span>
          <span>·</span>
          <span>{formatDuration(workout.estimatedDurationSec)}</span>
          <span>·</span>
          <span>{workout.estimatedCalories} kcal</span>
        </div>
      </header>

      {workout.description && (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {workout.description}
        </p>
      )}

      <Link
        href={`/workouts/${workout.id}/play`}
        className="block w-full rounded-lg bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        開始訓練
      </Link>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Segments ({workout.segments.length})
        </h2>
        <ol className="space-y-2">
          {workout.segments.map((s, i) => {
            const ex = exerciseMap?.get(s.exerciseId);
            return (
              <li
                key={s.segmentId}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                <span className="size-7 shrink-0 rounded-full bg-muted text-center text-xs leading-7 text-muted-foreground">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {ex?.name ?? "(動作不在快取)"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.durationSec}s × {s.rounds} 回 · 休息 {s.restAfterSec}s
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
