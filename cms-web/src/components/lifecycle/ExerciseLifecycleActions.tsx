"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { RejectDialog } from "./RejectDialog";
import {
  useApproveExercise,
  useRejectExercise,
  useSubmitExercise,
} from "@/lib/queries/exercises";
import type { ContentStatus } from "@/lib/domain/types";
import { useAuthStore } from "@/lib/auth/store";

interface Props {
  id: string;
  status: ContentStatus;
}

const REVIEWER_ROLES = new Set(["REVIEWER", "ADMIN"]);
const EDITOR_ROLES = new Set(["EDITOR", "REVIEWER", "ADMIN"]);

export function ExerciseLifecycleActions({ id, status }: Props) {
  const role = useAuthStore((s) => s.user?.role);
  const [rejectOpen, setRejectOpen] = useState(false);

  const submit = useSubmitExercise(id);
  const approve = useApproveExercise(id);
  const reject = useRejectExercise(id);

  const canSubmit = status === "DRAFT" && role && EDITOR_ROLES.has(role);
  const canReview = status === "IN_REVIEW" && role && REVIEWER_ROLES.has(role);

  return (
    <div className="flex items-center gap-2">
      {canSubmit && (
        <Button
          disabled={submit.isPending}
          onClick={() =>
            submit.mutate(undefined, {
              onSuccess: () => toast.success("已送審"),
              onError: (e) => toast.error((e as Error).message),
            })
          }
        >
          {submit.isPending ? "送審中..." : "送審"}
        </Button>
      )}
      {canReview && (
        <>
          <Button
            disabled={approve.isPending}
            onClick={() =>
              approve.mutate(undefined, {
                onSuccess: () => toast.success("已核准並發布"),
                onError: (e) => toast.error((e as Error).message),
              })
            }
          >
            {approve.isPending ? "核准中..." : "核准發布"}
          </Button>
          <Button variant="destructive" onClick={() => setRejectOpen(true)}>
            退回
          </Button>
          <RejectDialog
            open={rejectOpen}
            onOpenChange={setRejectOpen}
            pending={reject.isPending}
            onConfirm={(comment) =>
              reject.mutate(comment, {
                onSuccess: () => {
                  toast.success("已退回");
                  setRejectOpen(false);
                },
                onError: (e) => toast.error((e as Error).message),
              })
            }
          />
        </>
      )}
    </div>
  );
}
