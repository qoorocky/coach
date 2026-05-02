export type Difficulty = "beginner" | "intermediate" | "advanced";
export type ContentStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
export type WorkoutMode = "standard" | "tabata" | "emom" | "amrap";

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "beginner", label: "初級" },
  { value: "intermediate", label: "中級" },
  { value: "advanced", label: "高級" },
];

export const WORKOUT_MODE_OPTIONS: { value: WorkoutMode; label: string }[] = [
  { value: "standard", label: "標準" },
  { value: "tabata", label: "Tabata (20s/10s × 8)" },
  { value: "emom", label: "EMOM (每分鐘)" },
  { value: "amrap", label: "AMRAP (限時最多輪)" },
];

export const STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
  { value: "DRAFT", label: "草稿" },
  { value: "IN_REVIEW", label: "審核中" },
  { value: "PUBLISHED", label: "已發布" },
  { value: "ARCHIVED", label: "已封存" },
];

export const MUSCLE_OPTIONS: { value: string; label: string }[] = [
  { value: "chest", label: "胸" },
  { value: "back", label: "背" },
  { value: "shoulders", label: "肩" },
  { value: "biceps", label: "肱二頭" },
  { value: "triceps", label: "肱三頭" },
  { value: "forearms", label: "前臂" },
  { value: "core", label: "核心" },
  { value: "obliques", label: "腹斜肌" },
  { value: "quadriceps", label: "股四頭" },
  { value: "hamstrings", label: "腿後" },
  { value: "glutes", label: "臀" },
  { value: "calves", label: "小腿" },
  { value: "full_body", label: "全身" },
];

export const EQUIPMENT_OPTIONS: { value: string; label: string }[] = [
  { value: "none", label: "徒手" },
  { value: "mat", label: "瑜珈墊" },
  { value: "dumbbell", label: "啞鈴" },
  { value: "kettlebell", label: "壺鈴" },
  { value: "resistance_band", label: "彈力帶" },
];

export const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "hiit", label: "HIIT" },
  { value: "push", label: "上肢推" },
  { value: "pull", label: "上肢拉" },
  { value: "legs", label: "下肢" },
  { value: "core", label: "核心" },
  { value: "full_body", label: "全身" },
  { value: "cardio", label: "心肺" },
];

export const LICENSE_OPTIONS: { value: string; label: string }[] = [
  { value: "CC0", label: "CC0 公眾領域" },
  { value: "CC-BY", label: "CC BY" },
  { value: "CC-BY-SA", label: "CC BY-SA" },
  { value: "CC-BY-NC", label: "CC BY-NC" },
  { value: "CC-BY-NC-SA", label: "CC BY-NC-SA" },
  { value: "OWNED", label: "自有授權" },
];

export interface MusicTrack {
  id: string;
  name: string;
  artist: string | null;
  bpm: number | null;
  durationSec: number;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  license: string;
  licenseUrl: string | null;
  active: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export const TAG_OPTIONS: { value: string; label: string }[] = [
  { value: "fat_burn", label: "燃脂" },
  { value: "full_body", label: "全身" },
  { value: "core", label: "核心" },
  { value: "cardio", label: "有氧" },
  { value: "strength", label: "力量" },
  { value: "no_equipment", label: "無器材" },
  { value: "home", label: "居家" },
  { value: "morning", label: "早晨" },
  { value: "tabata", label: "Tabata" },
  { value: "emom", label: "EMOM" },
  { value: "amrap", label: "AMRAP" },
];

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface WorkoutSegment {
  segmentId: string;
  exerciseId: string;
  orderIndex: number;
  durationSec: number;
  restAfterSec: number;
  rounds: number;
}

export interface WorkoutDraft {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  difficulty: Difficulty;
  mode: WorkoutMode;
  estimatedDurationSec: number;
  estimatedCalories: number;
  tags: string[];
  trackIds: string[];
  createdByType: string | null;
  status: ContentStatus;
  currentVersion: number;
  createdBy: number;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
  segments: WorkoutSegment[];
}

export interface ExerciseDraft {
  id: string;
  nameZh: string;
  nameEn: string;
  description: string;
  difficulty: Difficulty;
  videoUrl: string | null;
  videoSizeBytes: number | null;
  thumbnailUrl: string | null;
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[] | null;
  category: string | null;
  status: ContentStatus;
  currentVersion: number;
  createdBy: number;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
}
