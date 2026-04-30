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

  if (data.status !== "DRAFT") {
    return (
      <div className="space-y-3">
        <BackLink href="/workouts" />
        <h1 className="text-xl font-semibold">無法編輯</h1>
        <p className="text-sm text-muted-foreground">
          只有草稿狀態可以編輯，目前狀態為 {data.status}。
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
