"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  segmentSchema,
  toSegmentUpsertRequest,
  type SegmentFormInput,
  type SegmentUpsertRequest,
} from "@/lib/schemas/workout";
import type { ExerciseDraft, WorkoutSegment } from "@/lib/domain/types";

interface ExerciseItem {
  value: string;
  label: string;
  searchText: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: WorkoutSegment;
  exercises: ExerciseDraft[];
  pending?: boolean;
  onConfirm: (req: SegmentUpsertRequest) => void;
}

function defaultsFrom(initial?: WorkoutSegment, firstExerciseId?: string): SegmentFormInput {
  if (!initial) {
    return {
      exerciseId: firstExerciseId ?? "",
      durationSec: "30",
      restAfterSec: "15",
      rounds: "1",
    };
  }
  return {
    exerciseId: initial.exerciseId,
    durationSec: String(initial.durationSec),
    restAfterSec: String(initial.restAfterSec),
    rounds: String(initial.rounds),
  };
}

export function SegmentDialog({
  open,
  onOpenChange,
  initial,
  exercises,
  pending,
  onConfirm,
}: Props) {
  const form = useForm<SegmentFormInput>({
    resolver: zodResolver(segmentSchema),
    defaultValues: defaultsFrom(initial, exercises[0]?.id),
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultsFrom(initial, exercises[0]?.id));
    }
  }, [open, initial, exercises, form]);

  const exerciseItems: ExerciseItem[] = exercises.map((ex) => ({
    value: ex.id,
    label: ex.nameZh,
    searchText: `${ex.nameZh} ${ex.nameEn}`.toLowerCase(),
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "編輯 segment" : "新增 segment"}</DialogTitle>
          <DialogDescription>
            僅可選擇已發布（PUBLISHED）的動作。
          </DialogDescription>
        </DialogHeader>

        <form
          id="segment-form"
          className="grid gap-4"
          onSubmit={form.handleSubmit((values) => {
            onConfirm(toSegmentUpsertRequest(values));
          })}
          noValidate
        >
          <div className="grid gap-1.5">
            <Label>動作 *</Label>
            <Combobox<ExerciseItem>
              items={exerciseItems}
              value={
                exerciseItems.find((it) => it.value === form.watch("exerciseId")) ?? null
              }
              onValueChange={(v) =>
                form.setValue("exerciseId", v?.value ?? "", { shouldDirty: true })
              }
              isItemEqualToValue={(a, b) => a.value === b.value}
              filter={(item, query) =>
                item.searchText.includes(query.toLowerCase())
              }
              disabled={pending || exercises.length === 0}
            >
              <ComboboxInput placeholder="搜尋動作..." />
              <ComboboxContent>
                <ComboboxEmpty>找不到符合的動作</ComboboxEmpty>
                <ComboboxList>
                  {(it: ExerciseItem) => (
                    <ComboboxItem key={it.value} value={it}>
                      {it.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            {exercises.length === 0 && (
              <p className="text-destructive text-sm">尚無已發布的動作可選</p>
            )}
            {form.formState.errors.exerciseId && (
              <p className="text-destructive text-sm">
                {form.formState.errors.exerciseId.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="durationSec">時長 (秒) *</Label>
              <Input
                id="durationSec"
                type="number"
                {...form.register("durationSec")}
                disabled={pending}
              />
              {form.formState.errors.durationSec && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.durationSec.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="restAfterSec">休息 (秒) *</Label>
              <Input
                id="restAfterSec"
                type="number"
                {...form.register("restAfterSec")}
                disabled={pending}
              />
              {form.formState.errors.restAfterSec && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.restAfterSec.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="rounds">回合數 *</Label>
              <Input
                id="rounds"
                type="number"
                {...form.register("rounds")}
                disabled={pending}
              />
              {form.formState.errors.rounds && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.rounds.message}
                </p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            取消
          </Button>
          <Button type="submit" form="segment-form" disabled={pending}>
            {pending ? "儲存中..." : "確認"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
