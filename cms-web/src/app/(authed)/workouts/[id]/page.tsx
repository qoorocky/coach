"use client";

import Link from "next/link";
import { use } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { BackLink } from "@/components/nav/BackLink";
import { StatusBadge } from "@/components/lifecycle/StatusBadge";
import { WorkoutLifecycleActions } from "@/components/lifecycle/WorkoutLifecycleActions";
import { AuditTimeline } from "@/components/lifecycle/AuditTimeline";

import { useWorkout } from "@/lib/queries/workouts";
import { useExercises } from "@/lib/queries/exercises";
import { DIFFICULTY_OPTIONS, TAG_OPTIONS, WORKOUT_MODE_OPTIONS } from "@/lib/domain/types";

interface Props {
  params: Promise<{ id: string }>;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m} 分` : `${m} 分 ${s} 秒`;
}

export default function WorkoutDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data, isPending, error } = useWorkout(id);
  const exercisesQuery = useExercises({ status: "PUBLISHED", page: 0, size: 200 });
  const exerciseById = new Map(
    (exercisesQuery.data?.content ?? []).map((ex) => [ex.id, ex]),
  );

  if (isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-3">
        <BackLink href="/workouts" />
        <h1 className="text-xl font-semibold">找不到課程</h1>
        <p className="text-sm text-muted-foreground">
          {error ? (error as Error).message : "資料不存在"}
        </p>
      </div>
    );
  }

  const difficultyLabel =
    DIFFICULTY_OPTIONS.find((o) => o.value === data.difficulty)?.label ??
    data.difficulty;

  return (
    <div className="space-y-6">
      <BackLink href="/workouts" />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{data.name}</h1>
            <StatusBadge status={data.status} />
            <span className="text-sm text-muted-foreground">v{data.currentVersion}</span>
          </div>
          {data.description && (
            <p className="text-sm text-muted-foreground">{data.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {(data.status === "DRAFT" || data.status === "PUBLISHED") && (
            <Button
              variant="outline"
              render={<Link href={`/workouts/${data.id}/edit`} />}
            >
              編輯
            </Button>
          )}
          <WorkoutLifecycleActions id={data.id} status={data.status} />
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-4">
        <Field label="難度" value={difficultyLabel} />
        <Field
          label="模式"
          value={
            WORKOUT_MODE_OPTIONS.find((o) => o.value === data.mode)?.label ??
            data.mode
          }
        />
        <Field label="預估時長" value={formatDuration(data.estimatedDurationSec)} />
        <Field label="預估卡路里" value={`${data.estimatedCalories} kcal`} />
      </div>

      {data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.tags.map((t) => (
            <span
              key={t}
              className="inline-flex h-6 items-center rounded-full border bg-muted px-2.5 text-xs"
            >
              {TAG_OPTIONS.find((o) => o.value === t)?.label ?? t}
            </span>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-2">Segments ({data.segments.length})</h2>
        {data.segments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
            尚無 segment
          </p>
        ) : (
          <ol className="space-y-2">
            {data.segments.map((s, i) => {
              const ex = exerciseById.get(s.exerciseId);
              return (
                <li
                  key={s.segmentId}
                  className="flex items-center gap-3 rounded-md border bg-card p-2"
                >
                  <span className="text-xs text-muted-foreground w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {ex?.nameZh ?? "(已刪除或未發布動作)"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.durationSec}s × {s.rounds} 回 · 休息 {s.restAfterSec}s
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {data.coverImageUrl && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">封面圖</p>
          <img
            src={data.coverImageUrl}
            alt="封面"
            className="w-full max-w-md rounded-md border bg-muted object-cover"
          />
        </div>
      )}

      <AuditTimeline entityType="WORKOUT" id={data.id} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
