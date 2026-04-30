"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { WorkoutForm } from "@/components/forms/WorkoutForm";
import { useCreateWorkout } from "@/lib/queries/workouts";

export default function NewWorkoutPage() {
  const router = useRouter();
  const create = useCreateWorkout();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">新增課程</h1>
        <p className="text-sm text-muted-foreground">
          建立草稿後可繼續編輯 segments 與送審。
        </p>
      </div>
      <WorkoutForm
        submitLabel="建立"
        pending={create.isPending}
        onCancel={() => router.push("/workouts")}
        onSubmit={(req) =>
          create.mutate(req, {
            onSuccess: (created) => {
              toast.success("已建立課程");
              router.push(`/workouts/${created.id}/edit`);
            },
            onError: (e) => toast.error((e as Error).message),
          })
        }
      />
    </div>
  );
}
