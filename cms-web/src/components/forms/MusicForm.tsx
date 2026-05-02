"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  musicFormSchema,
  toMusicUpsertRequest,
  type MusicFormInput,
  type MusicUpsertRequest,
} from "@/lib/schemas/music";
import { LICENSE_OPTIONS } from "@/lib/domain/types";
import type { MusicTrack } from "@/lib/domain/types";
import { uploadFile } from "@/lib/api/uploads";

interface Props {
  initial?: MusicTrack;
  submitLabel?: string;
  pending?: boolean;
  onSubmit: (req: MusicUpsertRequest) => void;
  onCancel?: () => void;
}

const ACCEPT = "audio/mpeg,audio/mp4,audio/x-m4a,audio/aac,audio/wav";

function defaultsFrom(initial?: MusicTrack): MusicFormInput {
  if (!initial) {
    return {
      name: "",
      artist: "",
      bpm: "",
      fileUrl: "",
      fileSizeBytes: 0,
      mimeType: "",
      durationSec: 0,
      license: "CC0",
      licenseUrl: "",
      active: true,
    };
  }
  return {
    name: initial.name,
    artist: initial.artist ?? "",
    bpm: initial.bpm != null ? String(initial.bpm) : "",
    fileUrl: initial.fileUrl,
    fileSizeBytes: initial.fileSizeBytes,
    mimeType: initial.mimeType,
    durationSec: initial.durationSec,
    license: initial.license,
    licenseUrl: initial.licenseUrl ?? "",
    active: initial.active,
  };
}

async function probeDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      resolve(Number.isFinite(audio.duration) ? Math.round(audio.duration) : 0);
    };
    audio.onerror = () => resolve(0);
    audio.src = url;
  });
}

async function detectBpm(file: File): Promise<number | null> {
  try {
    const { analyze } = await import("web-audio-beat-detector");
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor();
    try {
      const buf = await file.arrayBuffer();
      const decoded = await ctx.decodeAudioData(buf.slice(0));
      const bpm = await analyze(decoded);
      return Math.round(bpm);
    } finally {
      void ctx.close().catch(() => {});
    }
  } catch {
    return null;
  }
}

export function MusicForm({ initial, submitLabel = "儲存", pending, onSubmit, onCancel }: Props) {
  const form = useForm<MusicFormInput>({
    resolver: zodResolver(musicFormSchema),
    defaultValues: defaultsFrom(initial),
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [detectingBpm, setDetectingBpm] = useState(false);

  const fileUrl = form.watch("fileUrl");
  const fileSizeBytes = form.watch("fileSizeBytes");
  const durationSec = form.watch("durationSec");

  useEffect(() => {
    form.setValue("name", form.getValues("name") || initial?.name || "");
  }, [form, initial?.name]);

  async function onPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const meta = await uploadFile(file);
      form.setValue("fileUrl", meta.url, { shouldDirty: true });
      form.setValue("fileSizeBytes", meta.sizeBytes, { shouldDirty: true });
      form.setValue("mimeType", meta.mimeType, { shouldDirty: true });
      const dur = await probeDuration(meta.url);
      form.setValue("durationSec", dur, { shouldDirty: true });
      const cur = form.getValues("name");
      if (!cur && meta.originalFilename) {
        const stem = meta.originalFilename.replace(/\.[^.]+$/, "");
        form.setValue("name", stem, { shouldDirty: true });
      }
      toast.success("上傳成功");

      setDetectingBpm(true);
      detectBpm(file)
        .then((bpm) => {
          if (bpm != null) {
            form.setValue("bpm", String(bpm), { shouldDirty: true });
            toast.success(`偵測 BPM：${bpm}`);
          }
        })
        .finally(() => setDetectingBpm(false));
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const fileSizeMb =
    fileSizeBytes > 0 ? `${(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB` : "—";

  return (
    <form
      className="grid gap-4 max-w-2xl"
      onSubmit={form.handleSubmit((values) => onSubmit(toMusicUpsertRequest(values)))}
      noValidate
    >
      <div className="grid gap-1.5">
        <Label>音樂檔 *</Label>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={onPicked}
          disabled={pending || uploading}
        />
        {fileUrl ? (
          <div className="flex items-start gap-3 rounded-md border bg-card p-3">
            <audio src={fileUrl} controls preload="metadata" className="h-10 w-full max-w-md" />
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <span>{fileSizeMb}</span>
              <span>{durationSec > 0 ? `${durationSec} 秒` : "—"}</span>
              <button
                type="button"
                onClick={() => {
                  form.setValue("fileUrl", "", { shouldDirty: true });
                  form.setValue("fileSizeBytes", 0, { shouldDirty: true });
                  form.setValue("durationSec", 0, { shouldDirty: true });
                }}
                disabled={pending}
                className="inline-flex items-center gap-1 self-start text-destructive hover:underline"
              >
                <X className="size-3" /> 清除
              </button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={pending || uploading}
          >
            <Upload className="size-4" />
            {uploading ? "上傳中..." : "選擇音樂檔"}
          </Button>
        )}
        {form.formState.errors.fileUrl && (
          <p className="text-destructive text-sm">{form.formState.errors.fileUrl.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          支援 mp3 / m4a / aac / wav，最大 20 MB
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="name">名稱 *</Label>
        <Input id="name" {...form.register("name")} disabled={pending} />
        {form.formState.errors.name && (
          <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="artist">藝人</Label>
          <Input id="artist" {...form.register("artist")} disabled={pending} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="bpm">
            BPM{" "}
            {detectingBpm && (
              <span className="text-xs text-muted-foreground">偵測中...</span>
            )}
          </Label>
          <Input id="bpm" type="number" {...form.register("bpm")} disabled={pending} />
          {form.formState.errors.bpm && (
            <p className="text-destructive text-sm">{form.formState.errors.bpm.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label>授權 *</Label>
        <Select
          items={LICENSE_OPTIONS}
          value={form.watch("license")}
          onValueChange={(v) =>
            form.setValue("license", v ?? "CC0", { shouldDirty: true })
          }
          disabled={pending}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LICENSE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="licenseUrl">授權連結</Label>
        <Input
          id="licenseUrl"
          type="url"
          {...form.register("licenseUrl")}
          disabled={pending}
        />
        {form.formState.errors.licenseUrl && (
          <p className="text-destructive text-sm">{form.formState.errors.licenseUrl.message}</p>
        )}
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.watch("active")}
          onChange={(e) =>
            form.setValue("active", e.target.checked, { shouldDirty: true })
          }
          disabled={pending}
        />
        啟用（提供給 PWA 同步）
      </label>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending || uploading}>
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
