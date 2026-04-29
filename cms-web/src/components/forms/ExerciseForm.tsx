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

import {
  exerciseFormSchema,
  toUpsertRequest,
  type ExerciseFormInput,
  type ExerciseUpsertRequest,
} from "@/lib/schemas/exercise";
import {
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  EQUIPMENT_OPTIONS,
  MUSCLE_OPTIONS,
} from "@/lib/domain/types";
import type { ExerciseDraft } from "@/lib/domain/types";

interface Props {
  initial?: ExerciseDraft;
  submitLabel?: string;
  pending?: boolean;
  onSubmit: (req: ExerciseUpsertRequest) => void;
  onCancel?: () => void;
}

function defaultsFrom(initial?: ExerciseDraft): ExerciseFormInput {
  if (!initial) {
    return {
      nameZh: "",
      nameEn: "",
      description: "",
      difficulty: "beginner",
      videoUrl: "",
      videoSizeBytes: "",
      thumbnailUrl: "",
      equipment: [],
      primaryMuscles: [],
      secondaryMuscles: [],
      category: "",
    };
  }
  return {
    nameZh: initial.nameZh,
    nameEn: initial.nameEn,
    description: initial.description,
    difficulty: initial.difficulty,
    videoUrl: initial.videoUrl ?? "",
    videoSizeBytes:
      initial.videoSizeBytes != null ? String(initial.videoSizeBytes) : "",
    thumbnailUrl: initial.thumbnailUrl ?? "",
    equipment: initial.equipment,
    primaryMuscles: initial.primaryMuscles,
    secondaryMuscles: initial.secondaryMuscles ?? [],
    category: initial.category ?? "",
  };
}

const NONE_CATEGORY = "__none__";

export function ExerciseForm({
  initial,
  submitLabel = "儲存",
  pending,
  onSubmit,
  onCancel,
}: Props) {
  const form = useForm<ExerciseFormInput>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: defaultsFrom(initial),
  });

  return (
    <form
      className="grid gap-4 max-w-2xl"
      onSubmit={form.handleSubmit((values) => {
        onSubmit(toUpsertRequest(values));
      })}
      noValidate
    >
      <div className="grid gap-1.5">
        <Label htmlFor="nameZh">中文名稱 *</Label>
        <Input id="nameZh" {...form.register("nameZh")} disabled={pending} />
        {form.formState.errors.nameZh && (
          <p className="text-destructive text-sm">{form.formState.errors.nameZh.message}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="nameEn">英文名稱 *</Label>
        <Input id="nameEn" {...form.register("nameEn")} disabled={pending} />
        {form.formState.errors.nameEn && (
          <p className="text-destructive text-sm">{form.formState.errors.nameEn.message}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="description">說明 *</Label>
        <Textarea
          id="description"
          rows={4}
          {...form.register("description")}
          disabled={pending}
        />
        {form.formState.errors.description && (
          <p className="text-destructive text-sm">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label>難度 *</Label>
        <Select
          value={form.watch("difficulty")}
          onValueChange={(v) =>
            form.setValue("difficulty", v as ExerciseFormInput["difficulty"], {
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

      <Controller
        control={form.control}
        name="equipment"
        render={({ field, fieldState }) => (
          <div className="grid gap-1.5">
            <Label>器材 *</Label>
            <ChipGroup
              value={field.value}
              onChange={field.onChange}
              options={EQUIPMENT_OPTIONS}
              disabled={pending}
            />
            {fieldState.error && (
              <p className="text-destructive text-sm">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="primaryMuscles"
        render={({ field, fieldState }) => (
          <div className="grid gap-1.5">
            <Label>主要肌群 *</Label>
            <ChipGroup
              value={field.value}
              onChange={field.onChange}
              options={MUSCLE_OPTIONS}
              disabled={pending}
            />
            {fieldState.error && (
              <p className="text-destructive text-sm">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="secondaryMuscles"
        render={({ field }) => (
          <div className="grid gap-1.5">
            <Label>次要肌群</Label>
            <ChipGroup
              value={field.value}
              onChange={field.onChange}
              options={MUSCLE_OPTIONS}
              disabled={pending}
            />
          </div>
        )}
      />

      <div className="grid gap-1.5">
        <Label>分類</Label>
        <Select
          value={form.watch("category") || NONE_CATEGORY}
          onValueChange={(v) =>
            form.setValue("category", v && v !== NONE_CATEGORY ? v : "", {
              shouldDirty: true,
            })
          }
          disabled={pending}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_CATEGORY}>未分類</SelectItem>
            {CATEGORY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="videoUrl">影片 URL</Label>
        <Input
          id="videoUrl"
          type="url"
          {...form.register("videoUrl")}
          disabled={pending}
        />
        {form.formState.errors.videoUrl && (
          <p className="text-destructive text-sm">{form.formState.errors.videoUrl.message}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="videoSizeBytes">影片大小 (bytes)</Label>
        <Input
          id="videoSizeBytes"
          type="number"
          {...form.register("videoSizeBytes")}
          disabled={pending}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="thumbnailUrl">縮圖 URL</Label>
        <Input
          id="thumbnailUrl"
          type="url"
          {...form.register("thumbnailUrl")}
          disabled={pending}
        />
        {form.formState.errors.thumbnailUrl && (
          <p className="text-destructive text-sm">
            {form.formState.errors.thumbnailUrl.message}
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
