import { z } from "zod";

const urlOrEmpty = z.union([
  z.literal(""),
  z.string().url("請輸入有效的 URL"),
]);

export const exerciseFormSchema = z.object({
  nameZh: z.string().min(1, "請輸入中文名稱").max(100),
  nameEn: z.string().min(1, "請輸入英文名稱").max(100),
  description: z.string().min(1, "請輸入說明"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  videoUrl: urlOrEmpty,
  videoSizeBytes: z
    .string()
    .refine((s) => s === "" || /^\d+$/.test(s), "請輸入有效的數字"),
  thumbnailUrl: urlOrEmpty,
  equipment: z.array(z.string()).min(1, "器材至少需要一個值"),
  primaryMuscles: z.array(z.string()).min(1, "主要肌群至少需要一個值"),
  secondaryMuscles: z.array(z.string()),
  category: z.string(),
});

export type ExerciseFormInput = z.infer<typeof exerciseFormSchema>;

export interface ExerciseUpsertRequest {
  nameZh: string;
  nameEn: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  videoUrl?: string | null;
  videoSizeBytes?: number | null;
  thumbnailUrl?: string | null;
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  category?: string | null;
}

export function toUpsertRequest(values: ExerciseFormInput): ExerciseUpsertRequest {
  return {
    nameZh: values.nameZh.trim(),
    nameEn: values.nameEn.trim(),
    description: values.description.trim(),
    difficulty: values.difficulty,
    videoUrl: values.videoUrl || null,
    videoSizeBytes: values.videoSizeBytes ? Number(values.videoSizeBytes) : null,
    thumbnailUrl: values.thumbnailUrl || null,
    equipment: values.equipment,
    primaryMuscles: values.primaryMuscles,
    secondaryMuscles: values.secondaryMuscles,
    category: values.category.trim() || null,
  };
}
