"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { WorkoutForm } from "@/components/forms/WorkoutForm";
import { SegmentsEditor } from "@/components/forms/SegmentsEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { BackLink } from "@/components/nav/BackLink";

import { useUpdateWorkout, useWorkout } from "@/lib/queries/workouts";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditWorkoutPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isPending, error } = useWorkout(id);
  const update = useUpdateWorkout(id);

  if (isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full max-w-2xl" />
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

  if (data.status === "IN_REVIEW" || data.status === "ARCHIVED") {
    return (
      <div className="space-y-3">
        <BackLink href="/workouts" />
        <h1 className="text-xl font-semibold">無法編輯</h1>
        <p className="text-sm text-muted-foreground">
          {data.status === "IN_REVIEW"
            ? "審核中無法編輯，請先退回。"
            : "已封存無法編輯，請先重新上架。"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackLink href="/workouts" />
      <div>
        <h1 className="text-2xl font-semibold">編輯課程</h1>
        <p className="text-sm text-muted-foreground">{data.name}</p>
      </div>
      {data.status === "PUBLISHED" && (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          目前是已發布版本，儲存後會建立新草稿並退回 DRAFT 狀態，需重新送審 / 核准才會更新到 PWA。
        </p>
      )}

      <WorkoutForm
        initial={data}
        submitLabel="儲存變更"
        pending={update.isPending}
        onCancel={() => router.push("/workouts")}
        onSubmit={(req) =>
          update.mutate(req, {
            onSuccess: () => toast.success("已更新基本資料"),
            onError: (e) => toast.error((e as Error).message),
          })
        }
      />

      <Separator />

      <SegmentsEditor workoutId={id} segments={data.segments} />
    </div>
  );
}
