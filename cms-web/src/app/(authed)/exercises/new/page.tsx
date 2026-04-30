"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ExerciseForm } from "@/components/forms/ExerciseForm";
import { BackLink } from "@/components/nav/BackLink";
import { useCreateExercise } from "@/lib/queries/exercises";

export default function NewExercisePage() {
  const router = useRouter();
  const create = useCreateExercise();

  return (
    <div className="space-y-4">
      <BackLink href="/exercises" />
      <div>
        <h1 className="text-2xl font-semibold">新增動作</h1>
        <p className="text-sm text-muted-foreground">建立草稿後可繼續編輯或送審。</p>
      </div>
      <ExerciseForm
        submitLabel="建立"
        pending={create.isPending}
        onCancel={() => router.push("/exercises")}
        onSubmit={(req) =>
          create.mutate(req, {
            onSuccess: (created) => {
              toast.success("已建立動作");
              router.push(`/exercises/${created.id}`);
            },
            onError: (e) => toast.error((e as Error).message),
          })
        }
      />
    </div>
  );
}
