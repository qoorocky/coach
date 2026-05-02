"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChipGroup } from "@/components/ui/chip-group";
import { FileUploadField } from "@/components/forms/FileUploadField";
import { TrackPicker } from "@/components/forms/TrackPicker";

import {
  toWorkoutUpsertRequest,
  workoutFormSchema,
  type WorkoutFormInput,
  type WorkoutUpsertRequest,
} from "@/lib/schemas/workout";
import { DIFFICULTY_OPTIONS, TAG_OPTIONS, WORKOUT_MODE_OPTIONS } from "@/lib/domain/types";
import type { WorkoutDraft } from "@/lib/domain/types";

interface Props {
  initial?: WorkoutDraft;
  submitLabel?: string;
  pending?: boolean;
  onSubmit: (req: WorkoutUpsertRequest) => void;
  onCancel?: () => void;
}

function defaultsFrom(initial?: WorkoutDraft): WorkoutFormInput {
  if (!initial) {
    return {
      name: "",
      description: "",
      coverImageUrl: "",
      difficulty: "beginner",
      estimatedDurationSec: "0",
      estimatedCalories: "0",
      tags: [],
      trackIds: [],
      mode: "standard",
    };
  }
  return {
    name: initial.name,
    description: initial.description ?? "",
    coverImageUrl: initial.coverImageUrl ?? "",
    difficulty: initial.difficulty,
    mode: initial.mode ?? "standard",
    estimatedDurationSec: String(initial.estimatedDurationSec),
    estimatedCalories: String(initial.estimatedCalories),
    tags: initial.tags,
    trackIds: initial.trackIds ?? [],
  };
}

export function WorkoutForm({
  initial,
  submitLabel = "儲存",
  pending,
  onSubmit,
  onCancel,
}: Props) {
  const form = useForm<WorkoutFormInput>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: defaultsFrom(initial),
  });

  return (
    <form
      className="grid gap-4 max-w-2xl"
      onSubmit={form.handleSubmit((values) => {
        onSubmit(toWorkoutUpsertRequest(values));
      })}
      noValidate
    >
      <div className="grid gap-1.5">
        <Label htmlFor="name">名稱 *</Label>
        <Input id="name" {...form.register("name")} disabled={pending} />
        {form.formState.errors.name && (
          <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="description">說明</Label>
        <Textarea
          id="description"
          rows={3}
          {...form.register("description")}
          disabled={pending}
        />
      </div>

      <div className="grid gap-1.5">
        <Label>難度 *</Label>
        <Select
          items={DIFFICULTY_OPTIONS}
          value={form.watch("difficulty")}
          onValueChange={(v) =>
            form.setValue("difficulty", v as WorkoutFormInput["difficulty"], {
              shouldDirty: true,
            })
          }
          disabled={pending}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label>模式 *</Label>
        <Select
          items={WORKOUT_MODE_OPTIONS}
          value={form.watch("mode")}
          onValueChange={(v) =>
            form.setValue("mode", v as WorkoutFormInput["mode"], {
              shouldDirty: true,
            })
          }
          disabled={pending}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WORKOUT_MODE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          標準：依 segments 順序執行；Tabata：每段 8 回 × 20s/10s；EMOM：每分鐘換段；AMRAP：限時內循環，segment.rounds 略過。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="estimatedDurationSec">預估總時長 (秒) *</Label>
          <Input
            id="estimatedDurationSec"
            type="number"
            {...form.register("estimatedDurationSec")}
            disabled={pending}
          />
          {form.formState.errors.estimatedDurationSec && (
            <p className="text-destructive text-sm">
              {form.formState.errors.estimatedDurationSec.message}
            </p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="estimatedCalories">預估卡路里 *</Label>
          <Input
            id="estimatedCalories"
            type="number"
            {...form.register("estimatedCalories")}
            disabled={pending}
          />
          {form.formState.errors.estimatedCalories && (
            <p className="text-destructive text-sm">
              {form.formState.errors.estimatedCalories.message}
            </p>
          )}
        </div>
      </div>

      <Controller
        control={form.control}
        name="tags"
        render={({ field }) => (
          <div className="grid gap-1.5">
            <Label>標籤</Label>
            <ChipGroup
              value={field.value}
              onChange={field.onChange}
              options={TAG_OPTIONS}
              disabled={pending}
            />
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="trackIds"
        render={({ field }) => (
          <div className="grid gap-1.5">
            <Label>背景音樂</Label>
            <TrackPicker
              value={field.value}
              onChange={field.onChange}
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              訓練時依序循環播放選定的曲目；不選則靜音。
            </p>
          </div>
        )}
      />

      <div className="grid gap-1.5">
        <Label>封面圖</Label>
        <FileUploadField
          kind="image"
          value={form.watch("coverImageUrl")}
          onChange={(url) =>
            form.setValue("coverImageUrl", url ?? "", { shouldDirty: true })
          }
          disabled={pending}
          maxLabel="支援 png / jpeg / webp / gif，最大 10 MB"
        />
        {form.formState.errors.coverImageUrl && (
          <p className="text-destructive text-sm">
            {form.formState.errors.coverImageUrl.message}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "儲存中..." : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            取消
          </Button>
        )}
      </div>
    </form>
  );
}
