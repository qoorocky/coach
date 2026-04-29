"use client";

import Link from "next/link";
import { use } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/lifecycle/StatusBadge";
import { ExerciseLifecycleActions } from "@/components/lifecycle/ExerciseLifecycleActions";

import { useExercise } from "@/lib/queries/exercises";
import {
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  EQUIPMENT_OPTIONS,
  MUSCLE_OPTIONS,
} from "@/lib/domain/types";

function labelOf(options: { value: string; label: string }[], v: string): string {
  return options.find((o) => o.value === v)?.label ?? v;
}

function joinLabels(options: { value: string; label: string }[], values: string[]): string {
  return values.map((v) => labelOf(options, v)).join("、");
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function ExerciseDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data, isPending, error } = useExercise(id);

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
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">找不到動作</h1>
        <p className="text-sm text-muted-foreground">
          {error ? (error as Error).message : "資料不存在"}
        </p>
        <Button variant="outline" render={<Link href="/exercises" />}>
          回列表
        </Button>
      </div>
    );
  }

  const difficultyLabel =
    DIFFICULTY_OPTIONS.find((o) => o.value === data.difficulty)?.label ??
    data.difficulty;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{data.nameZh}</h1>
            <StatusBadge status={data.status} />
            <span className="text-sm text-muted-foreground">v{data.currentVersion}</span>
          </div>
          <p className="text-sm text-muted-foreground">{data.nameEn}</p>
        </div>
        <div className="flex items-center gap-2">
          {data.status === "DRAFT" && (
            <Button
              variant="outline"
              render={<Link href={`/exercises/${data.id}/edit`} />}
            >
              編輯
            </Button>
          )}
          <ExerciseLifecycleActions id={data.id} status={data.status} />
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="難度" value={difficultyLabel} />
        <Field
          label="分類"
          value={data.category ? labelOf(CATEGORY_OPTIONS, data.category) : "—"}
        />
        <Field
          label="器材"
          value={joinLabels(EQUIPMENT_OPTIONS, data.equipment) || "—"}
        />
        <Field
          label="主要肌群"
          value={joinLabels(MUSCLE_OPTIONS, data.primaryMuscles) || "—"}
        />
        <Field
          label="次要肌群"
          value={joinLabels(MUSCLE_OPTIONS, data.secondaryMuscles ?? []) || "—"}
        />
        <Field
          label="影片大小"
          value={
            data.videoSizeBytes != null
              ? `${(data.videoSizeBytes / (1024 * 1024)).toFixed(2)} MB`
              : "—"
          }
        />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">說明</p>
        <p className="whitespace-pre-wrap text-sm">{data.description}</p>
      </div>

      {data.videoUrl && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">影片連結</p>
          <a
            href={data.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all"
          >
            {data.videoUrl}
          </a>
        </div>
      )}

      {data.thumbnailUrl && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">縮圖</p>
          <a
            href={data.thumbnailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all"
          >
            {data.thumbnailUrl}
          </a>
        </div>
      )}
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
