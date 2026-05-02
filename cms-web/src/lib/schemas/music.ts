import { z } from "zod";

const urlOrEmpty = z.union([
  z.literal(""),
  z.string().url("請輸入有效的 URL"),
]);

export const musicFormSchema = z.object({
  name: z.string().min(1, "請輸入名稱").max(200),
  artist: z.string().max(200),
  bpm: z
    .string()
    .refine((s) => s === "" || /^\d+$/.test(s), "請輸入數字"),
  fileUrl: z.string().url("請先上傳音樂檔"),
  fileSizeBytes: z.number().int().nonnegative(),
  mimeType: z.string().min(1),
  durationSec: z.number().int().nonnegative(),
  license: z.string().min(1, "請選擇授權"),
  licenseUrl: urlOrEmpty,
  active: z.boolean(),
});

export type MusicFormInput = z.infer<typeof musicFormSchema>;

export interface MusicUpsertRequest {
  name: string;
  artist?: string | null;
  bpm?: number | null;
  durationSec: number;
  fileUrl: string;
  fileSizeBytes: number;
  mimeType: string;
  license: string;
  licenseUrl?: string | null;
  active?: boolean;
}

export function toMusicUpsertRequest(values: MusicFormInput): MusicUpsertRequest {
  return {
    name: values.name.trim(),
    artist: values.artist.trim() || null,
    bpm: values.bpm ? Number(values.bpm) : null,
    durationSec: values.durationSec,
    fileUrl: values.fileUrl,
    fileSizeBytes: values.fileSizeBytes,
    mimeType: values.mimeType,
    license: values.license,
    licenseUrl: values.licenseUrl || null,
    active: values.active,
  };
}
