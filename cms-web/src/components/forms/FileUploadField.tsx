"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { uploadFile, type UploadResponse } from "@/lib/api/uploads";

type Kind = "image" | "video";

interface Props {
  kind: Kind;
  value: string | null | undefined;
  onChange: (url: string | null, meta?: UploadResponse) => void;
  disabled?: boolean;
  maxLabel?: string;
}

const ACCEPT: Record<Kind, string> = {
  image: "image/png,image/jpeg,image/webp,image/gif",
  video: "video/mp4,video/quicktime,video/webm",
};

export function FileUploadField({ kind, value, onChange, disabled, maxLabel }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function pick() {
    inputRef.current?.click();
  }

  async function onPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const meta = await uploadFile(file);
      onChange(meta.url, meta);
      toast.success("上傳成功");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        className="hidden"
        onChange={onPicked}
        disabled={disabled || uploading}
      />
      {value ? (
        <div className="flex items-start gap-3">
          {kind === "image" ? (
            <img
              src={value}
              alt="預覽"
              className="size-24 rounded-md border object-cover bg-muted"
            />
          ) : (
            <video
              src={value}
              className="h-24 w-40 rounded-md border bg-black object-cover"
              controls
              preload="metadata"
            />
          )}
          <div className="flex-1 min-w-0 space-y-1">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline break-all"
            >
              {value}
            </a>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={pick}
                disabled={disabled || uploading}
              >
                {uploading ? "上傳中..." : "重新上傳"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange(null)}
                disabled={disabled || uploading}
              >
                <X className="size-3.5" />
                清除
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={pick}
            disabled={disabled || uploading}
          >
            <Upload className="size-4" />
            {uploading ? "上傳中..." : `選擇${kind === "image" ? "圖片" : "影片"}`}
          </Button>
          {maxLabel && (
            <p className="text-xs text-muted-foreground mt-1">{maxLabel}</p>
          )}
        </div>
      )}
    </div>
  );
}
