"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useAllMusic } from "@/lib/queries/music";
import type { MusicTrack } from "@/lib/domain/types";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

interface TrackItem {
  value: string;
  label: string;
  searchText: string;
}

function formatDuration(sec: number): string {
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function TrackPicker({ value, onChange, disabled }: Props) {
  const { data, isPending } = useAllMusic();
  const all: MusicTrack[] = data?.content ?? [];
  const [pending, setPending] = useState<TrackItem | null>(null);

  const byId = new Map(all.map((t) => [t.id, t]));
  const available = all.filter((t) => t.active && !value.includes(t.id));
  const items: TrackItem[] = available.map((t) => ({
    value: t.id,
    label: t.artist ? `${t.name} — ${t.artist}` : t.name,
    searchText: `${t.name} ${t.artist ?? ""}`.toLowerCase(),
  }));

  function add() {
    if (!pending) return;
    onChange([...value, pending.value]);
    setPending(null);
  }

  function remove(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  function move(id: string, dir: -1 | 1) {
    const idx = value.indexOf(id);
    if (idx < 0) return;
    const next = [...value];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {value.length === 0 ? (
        <p className="rounded-md border border-dashed bg-card px-3 py-4 text-center text-sm text-muted-foreground">
          尚未選擇曲目
        </p>
      ) : (
        <ol className="space-y-1.5">
          {value.map((id, i) => {
            const t = byId.get(id);
            return (
              <li
                key={id}
                className="flex items-center gap-2 rounded-md border bg-card p-2"
              >
                <span className="size-6 shrink-0 rounded-full bg-muted text-center text-xs leading-6 text-muted-foreground">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {t ? (
                    <>
                      <p className="font-medium truncate">{t.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[t.artist, formatDuration(t.durationSec), t.bpm ? `${t.bpm} BPM` : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      (找不到曲目，可能已刪除)
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => move(id, -1)}
                  disabled={disabled || i === 0}
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => move(id, 1)}
                  disabled={disabled || i === value.length - 1}
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(id)}
                  disabled={disabled}
                >
                  <X className="size-3.5" />
                </Button>
              </li>
            );
          })}
        </ol>
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <Combobox<TrackItem>
            items={items}
            value={pending}
            onValueChange={(v) => setPending(v)}
            isItemEqualToValue={(a, b) => a.value === b.value}
            filter={(item, q) => item.searchText.includes(q.toLowerCase())}
            disabled={disabled || isPending || items.length === 0}
          >
            <ComboboxInput
              placeholder={
                isPending
                  ? "載入中..."
                  : items.length === 0
                    ? "沒有可加入的曲目"
                    : "搜尋曲目..."
              }
            />
            <ComboboxContent>
              <ComboboxEmpty>找不到符合的曲目</ComboboxEmpty>
              <ComboboxList>
                {(it: TrackItem) => (
                  <ComboboxItem key={it.value} value={it}>
                    {it.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
        <Button type="button" onClick={add} disabled={disabled || !pending} size="sm">
          <Plus className="size-4" />
          加入
        </Button>
      </div>
    </div>
  );
}
