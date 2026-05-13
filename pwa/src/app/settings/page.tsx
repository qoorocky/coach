"use client";

import { useEffect, useState } from "react";
import { Volume2, Mic, Timer, Ruler } from "lucide-react";

import {
  DEFAULT_SETTINGS,
  loadSettings,
  updateSettings,
  useSettings,
  type DistanceUnit,
} from "@/lib/settings/store";
import { BottomNav } from "@/components/BottomNav";

export default function SettingsPage() {
  const settings = useSettings();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSettings().then(() => setReady(true));
  }, []);

  return (
    <main className="mx-auto max-w-md px-5 pt-6 pb-28 has-bottom-nav space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">設定</h1>
        <p className="text-sm text-sub">
          自訂語音、提示音、準備時長與顯示單位。
        </p>
      </header>

      <Section title="聲音" icon={<Volume2 className="size-4" />}>
        <ToggleRow
          label="提示音"
          description="倒數、開始、休息、完成的音效"
          checked={settings.beepEnabled}
          onChange={(v) => updateSettings({ beepEnabled: v })}
        />
        <SliderRow
          label="提示音音量"
          value={settings.beepVolume}
          min={0}
          max={1}
          step={0.05}
          disabled={!settings.beepEnabled}
          onChange={(v) => updateSettings({ beepVolume: v })}
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </Section>

      <Section title="語音播報" icon={<Mic className="size-4" />}>
        <ToggleRow
          label="動作名稱朗讀"
          description="切換段落時用 TTS 念出動作名稱"
          checked={settings.voiceEnabled}
          onChange={(v) => updateSettings({ voiceEnabled: v })}
        />
      </Section>

      <Section title="計時" icon={<Timer className="size-4" />}>
        <NumberRow
          label="準備倒數秒數"
          value={settings.prepareSec}
          min={0}
          max={30}
          onChange={(v) => updateSettings({ prepareSec: v })}
          suffix="秒"
          description="按下開始後到第一個動作之間的倒數"
        />
      </Section>

      <Section title="顯示單位" icon={<Ruler className="size-4" />}>
        <RadioRow<DistanceUnit>
          value={settings.unit}
          onChange={(v) => updateSettings({ unit: v })}
          options={[
            { value: "km", label: "公里 (km)" },
            { value: "mi", label: "英里 (mi)" },
          ]}
        />
      </Section>

      <button
        type="button"
        onClick={() => updateSettings(DEFAULT_SETTINGS)}
        className="text-xs text-sub underline-offset-4 hover:underline"
        disabled={!ready}
      >
        回復預設值
      </button>

      <BottomNav />
    </main>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-lg p-4 space-y-3">
      <h2 className="flex items-center gap-2 text-xs font-semibold text-sub uppercase tracking-wider">
        {icon}
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-3 cursor-pointer">
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-[11px] text-dim mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-pill"
        }`}
      >
        <span
          className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          } translate-y-0.5`}
        />
      </button>
    </label>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  format?: (v: number) => string;
}) {
  return (
    <div className={disabled ? "opacity-50" : undefined}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm">{label}</span>
        <span className="text-sm font-semibold tabular-nums">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--primary)]"
      />
    </div>
  );
}

function NumberRow({
  label,
  description,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">{label}</p>
          {description && (
            <p className="text-[11px] text-dim mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            className="size-7 rounded-md bg-pill hover:bg-muted text-base"
            aria-label="減少"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-semibold tabular-nums">
            {value}
            {suffix ? <span className="text-dim text-[11px] ml-0.5">{suffix}</span> : null}
          </span>
          <button
            type="button"
            onClick={() => onChange(Math.min(max, value + 1))}
            className="size-7 rounded-md bg-pill hover:bg-muted text-base"
            aria-label="增加"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function RadioRow<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-pill text-sub hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
