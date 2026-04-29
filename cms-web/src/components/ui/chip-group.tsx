"use client";

import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface ChipGroupProps {
  value: string[];
  onChange: (next: string[]) => void;
  options: Option[];
  disabled?: boolean;
}

export function ChipGroup({ value, onChange, options, disabled }: ChipGroupProps) {
  const set = new Set(value);
  const toggle = (v: string) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange(options.map((o) => o.value).filter((v) => next.has(v)));
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = set.has(o.value);
        return (
          <button
            key={o.value}
            type="button"
            disabled={disabled}
            onClick={() => toggle(o.value)}
            aria-pressed={active}
            className={cn(
              "inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted"
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
