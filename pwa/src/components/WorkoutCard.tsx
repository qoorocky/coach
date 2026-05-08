"use client";

import Link from "next/link";
import type { Workout } from "@coach/shared-types";

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

// Mode → category dot color, mirrors the design's catColors palette.
const MODE_COLOR: Record<string, string> = {
  standard: "#6366F1",
  tabata: "#F97316",
  emom: "#10B981",
  amrap: "#EF4444",
};

function formatDuration(sec: number): string {
  const m = Math.round(sec / 60);
  return `${m} 分`;
}

export function WorkoutCard({ workout }: { workout: Workout }) {
  const dot = MODE_COLOR[workout.mode] ?? "var(--primary)";
  const badge = DIFFICULTY_BADGE[workout.difficulty] ?? "";
  return (
    <Link
      href={`/workouts/${workout.id}`}
      className="glass block rounded p-3.5 transition active:scale-[0.99]"
    >
      <div className="flex items-start gap-3.5">
        {workout.coverImageUrl ? (
          <img
            src={workout.coverImageUrl}
            alt=""
            className="size-14 shrink-0 rounded object-cover bg-muted"
          />
        ) : (
          <div
            className="size-14 shrink-0 rounded flex items-center justify-center"
            style={{ background: "var(--pill)" }}
          >
            <span
              className="size-5 rounded-full"
              style={{ background: dot }}
              aria-hidden
            />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-sm font-semibold truncate text-foreground">
            {workout.name}
          </p>
          <p className="text-xs text-sub">
            {workout.mode.toUpperCase()} · {formatDuration(workout.estimatedDurationSec)}
          </p>
          <div className="flex items-center justify-between">
            <span
              className={`${badge} text-[11px] px-2 py-[2px] rounded-full font-medium`}
            >
              {DIFFICULTY_LABEL[workout.difficulty] ?? workout.difficulty}
            </span>
            <span className="text-[11px] text-dim">
              {workout.segments.length} 段 · {workout.estimatedCalories} kcal
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
