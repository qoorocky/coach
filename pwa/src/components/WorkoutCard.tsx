"use client";

import Link from "next/link";
import type { Workout } from "@coach/shared-types";

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "高級",
};

function formatDuration(sec: number): string {
  const m = Math.round(sec / 60);
  return `${m} 分`;
}

export function WorkoutCard({ workout }: { workout: Workout }) {
  return (
    <Link
      href={`/workouts/${workout.id}`}
      className="block rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30 active:bg-muted/50"
    >
      <div className="flex items-start gap-3">
        {workout.coverImageUrl ? (
          <img
            src={workout.coverImageUrl}
            alt=""
            className="size-16 shrink-0 rounded-md border object-cover bg-muted"
          />
        ) : (
          <div className="size-16 shrink-0 rounded-md border bg-muted" />
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-medium truncate">{workout.name}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{DIFFICULTY_LABEL[workout.difficulty] ?? workout.difficulty}</span>
            <span>·</span>
            <span>{formatDuration(workout.estimatedDurationSec)}</span>
            <span>·</span>
            <span>{workout.segments.length} segments</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
