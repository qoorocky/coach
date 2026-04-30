"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ExerciseForm } from "@/components/forms/ExerciseForm";
import { Skeleton } from "@/components/ui/skeleton";
import { BackLink } from "@/components/nav/BackLink";

import { useExercise, useUpdateExercise } from "@/lib/queries/exercises";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditExercisePage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isPending, error } = useExercise(id);
  const update = useUpdateExercise(id);

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
        <BackLink href="/exercises" />
        <h1 className="text-xl font-semibold">找不到動作</h1>
        <p className="text-sm text-muted-foreground">
          {error ? (error as Error).message : "資料不存在"}
        </p>
      </div>
    );
  }

  if (data.status !== "DRAFT") {
    return (
      <div className="space-y-3">
        <BackLink href="/exercises" />
        <h1 className="text-xl font-semibold">無法編輯</h1>
        <p className="text-sm text-muted-foreground">
          只有草稿狀態可以編輯，目前狀態為 {data.status}。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BackLink href="/exercises" />
      <div>
        <h1 className="text-2xl font-semibold">編輯動作</h1>
        <p className="text-sm text-muted-foreground">{data.nameZh}</p>
      </div>
      <ExerciseForm
        initial={data}
        submitLabel="儲存變更"
        pending={update.isPending}
        onCancel={() => router.push("/exercises")}
        onSubmit={(req) =>
          update.mutate(req, {
            onSuccess: () => {
              toast.success("已更新");
              router.push(`/exercises/${id}`);
            },
            onError: (e) => toast.error((e as Error).message),
          })
        }
      />
    </div>
  );
}
