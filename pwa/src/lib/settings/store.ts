"use client";

import { useSyncExternalStore } from "react";
import { getMeta, setMeta } from "../db";

export type DistanceUnit = "km" | "mi";

export interface UserSettings {
  /** Spoken cues at segment transitions. */
  voiceEnabled: boolean;
  /** Tone beeps for countdown, work start, rest, done. */
  beepEnabled: boolean;
  /** 0..1 multiplier applied on top of per-tone gain. */
  beepVolume: number;
  /** Pre-workout countdown length in seconds (was hardcoded to 5). */
  prepareSec: number;
  /** Display unit. Reserved for future running/walking metrics. */
  unit: DistanceUnit;
}

export const DEFAULT_SETTINGS: UserSettings = {
  voiceEnabled: true,
  beepEnabled: true,
  beepVolume: 0.7,
  prepareSec: 5,
  unit: "km",
};

const META_KEY = "user_settings_v1";

let current: UserSettings = { ...DEFAULT_SETTINGS };
let loaded = false;
let loadingPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function applyPatch(patch: Partial<UserSettings>): UserSettings {
  return {
    ...current,
    ...patch,
    beepVolume:
      patch.beepVolume != null
        ? Math.min(1, Math.max(0, patch.beepVolume))
        : current.beepVolume,
    prepareSec:
      patch.prepareSec != null
        ? Math.min(30, Math.max(0, Math.round(patch.prepareSec)))
        : current.prepareSec,
  };
}

export function getCurrentSettings(): UserSettings {
  return current;
}

export async function loadSettings(): Promise<UserSettings> {
  if (loaded) return current;
  if (loadingPromise) {
    await loadingPromise;
    return current;
  }
  loadingPromise = (async () => {
    try {
      const stored = await getMeta<Partial<UserSettings>>(META_KEY);
      if (stored) {
        current = applyPatch(stored);
      }
    } finally {
      loaded = true;
      loadingPromise = null;
      notify();
    }
  })();
  await loadingPromise;
  return current;
}

export async function updateSettings(
  patch: Partial<UserSettings>,
): Promise<UserSettings> {
  current = applyPatch(patch);
  notify();
  try {
    await setMeta(META_KEY, current);
  } catch {
    // Persistence failure shouldn't roll back the in-memory state — the UI
    // already reflects the change and a retry on next edit will recover.
  }
  return current;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getServerSnapshot(): UserSettings {
  return DEFAULT_SETTINGS;
}

export function useSettings(): UserSettings {
  return useSyncExternalStore(subscribe, getCurrentSettings, getServerSnapshot);
}

/** True once the IDB load has resolved at least once. */
export function isSettingsLoaded(): boolean {
  return loaded;
}
