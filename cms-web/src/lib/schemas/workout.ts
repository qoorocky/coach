import { z } from "zod";

const urlOrEmpty = z.union([
  z.literal(""),
  z.string().url("請輸入有效的 URL"),
]);

export const workoutFormSchema = z.object({
  name: z.string().min(1, "請輸入名稱").max(100),
  description: z.string(),
  coverImageUrl: urlOrEmpty,
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  mode: z.enum(["standard", "tabata", "emom", "amrap"]),
  estimatedDurationSec: z
    .string()
    .refine((s) => /^\d+$/.test(s), "請輸入有效的數字"),
  estimatedCalories: z
    .string()
    .refine((s) => /^\d+$/.test(s), "請輸入有效的數字"),
  tags: z.array(z.string()),
  trackIds: z.array(z.string()),
});

export type WorkoutFormInput = z.infer<typeof workoutFormSchema>;

export interface WorkoutUpsertRequest {
  name: string;
  description?: string | null;
  coverImageUrl?: string | null;
  difficulty: "beginner" | "intermediate" | "advanced";
  mode: "standard" | "tabata" | "emom" | "amrap";
  estimatedDurationSec: number;
  estimatedCalories: number;
  tags: string[];
  trackIds: string[];
  createdByType?: string | null;
}

export function toWorkoutUpsertRequest(values: WorkoutFormInput): WorkoutUpsertRequest {
  return {
    name: values.name.trim(),
    description: values.description.trim() || null,
    coverImageUrl: values.coverImageUrl || null,
    difficulty: values.difficulty,
    mode: values.mode,
    estimatedDurationSec: Number(values.estimatedDurationSec),
    estimatedCalories: Number(values.estimatedCalories),
    tags: values.tags,
    trackIds: values.trackIds,
  };
}

export const segmentSchema = z.object({
  exerciseId: z.string().uuid("請選擇動作"),
  durationSec: z
    .string()
    .refine((s) => /^\d+$/.test(s) && Number(s) >= 1, "至少 1 秒"),
  restAfterSec: z
    .string()
    .refine((s) => /^\d+$/.test(s), "請輸入有效的數字"),
  rounds: z
    .string()
    .refine((s) => /^\d+$/.test(s) && Number(s) >= 1, "至少 1 回"),
});

export type SegmentFormInput = z.infer<typeof segmentSchema>;

export interface SegmentUpsertRequest {
  exerciseId: string;
  durationSec: number;
  restAfterSec: number;
  rounds: number;
}

export function toSegmentUpsertRequest(values: SegmentFormInput): SegmentUpsertRequest {
  return {
    exerciseId: values.exerciseId,
    durationSec: Number(values.durationSec),
    restAfterSec: Number(values.restAfterSec),
    rounds: Number(values.rounds),
  };
}
