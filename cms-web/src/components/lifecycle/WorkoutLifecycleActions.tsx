"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { RejectDialog } from "./RejectDialog";
import {
  useApproveWorkout,
  useArchiveWorkout,
  useRejectWorkout,
  useSubmitWorkout,
  useUnarchiveWorkout,
} from "@/lib/queries/workouts";
import type { ContentStatus } from "@/lib/domain/types";
import { useAuthStore } from "@/lib/auth/store";

interface Props {
  id: string;
  status: ContentStatus;
}

const REVIEWER_ROLES = new Set(["REVIEWER", "ADMIN"]);
const EDITOR_ROLES = new Set(["EDITOR", "REVIEWER", "ADMIN"]);

export function WorkoutLifecycleActions({ id, status }: Props) {
  const role = useAuthStore((s) => s.user?.role);
  const [rejectOpen, setRejectOpen] = useState(false);

  const submit = useSubmitWorkout(id);
  const approve = useApproveWorkout(id);
  const reject = useRejectWorkout(id);
  const archive = useArchiveWorkout(id);
  const unarchive = useUnarchiveWorkout(id);

  const canSubmit = status === "DRAFT" && role && EDITOR_ROLES.has(role);
  const canReview = status === "IN_REVIEW" && role && REVIEWER_ROLES.has(role);
  const canArchive = status === "PUBLISHED" && role && REVIEWER_ROLES.has(role);
  const canUnarchive = status === "ARCHIVED" && role && REVIEWER_ROLES.has(role);

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
      {canArchive && (
        <Button
          variant="destructive"
          disabled={archive.isPending}
          onClick={() => {
            if (!confirm("下架後 PWA 會收到刪除指令，下次同步即生效。確定？")) return;
            archive.mutate(undefined, {
              onSuccess: () => toast.success("已下架"),
              onError: (e) => toast.error((e as Error).message),
            });
          }}
        >
          {archive.isPending ? "下架中..." : "下架"}
        </Button>
      )}
      {canUnarchive && (
        <Button
          disabled={unarchive.isPending}
          onClick={() =>
            unarchive.mutate(undefined, {
              onSuccess: () => toast.success("已重新上架"),
              onError: (e) => toast.error((e as Error).message),
            })
          }
        >
          {unarchive.isPending ? "上架中..." : "重新上架"}
        </Button>
      )}
    </div>
  );
}
