"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HeartRateSample } from "@coach/shared-types";

// Web Bluetooth GATT — Heart Rate Service / Heart Rate Measurement char.
const HR_SERVICE = 0x180d;
const HR_MEASUREMENT = 0x2a37;

// 5-zone Karvonen-style cut-offs as fraction of HRmax.
// HRmax defaults to 190 (≈ 30yo "220 − age" estimate). Real value will come
// from a future settings page; for now we hardcode the default.
const DEFAULT_MAX_HR = 190;
const ZONE_THRESHOLDS: Array<[number, HrZone]> = [
  [0.9, 5],
  [0.8, 4],
  [0.7, 3],
  [0.6, 2],
];

export type HrZone = 1 | 2 | 3 | 4 | 5;

export function bpmZone(bpm: number, maxHr = DEFAULT_MAX_HR): HrZone {
  const pct = bpm / maxHr;
  for (const [t, z] of ZONE_THRESHOLDS) {
    if (pct >= t) return z;
  }
  return 1;
}

// Tailwind-friendly colours; player surface is dark so we use saturated hex.
export const ZONE_STYLE: Record<HrZone, { label: string; color: string }> = {
  1: { label: "Z1 暖身", color: "#94a3b8" },
  2: { label: "Z2 輕度", color: "#3b82f6" },
  3: { label: "Z3 有氧", color: "#10b981" },
  4: { label: "Z4 高強", color: "#f59e0b" },
  5: { label: "Z5 極限", color: "#ef4444" },
};

export type HrStatus = "idle" | "connecting" | "connected" | "error";

export interface HeartRateMonitor {
  status: HrStatus;
  bpm: number | null;
  error: string | null;
  deviceName: string | null;
  isSupported: boolean;
  /** Stable ref to the recorded samples buffer. Mutated in place by the hook. */
  samples: HeartRateSample[];
  connect: () => Promise<void>;
  disconnect: () => void;
  resetSamples: () => void;
}

// Web Bluetooth isn't in lib.dom.d.ts. Minimal ambient types so this module
// compiles without pulling in @types/web-bluetooth as a dep.
declare global {
  interface BluetoothDevice extends EventTarget {
    name?: string;
    gatt?: BluetoothRemoteGATTServer;
  }
  interface BluetoothRemoteGATTServer {
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): void;
    connected: boolean;
    getPrimaryService(s: number | string): Promise<BluetoothRemoteGATTService>;
  }
  interface BluetoothRemoteGATTService {
    getCharacteristic(c: number | string): Promise<BluetoothRemoteGATTCharacteristic>;
  }
  interface BluetoothRemoteGATTCharacteristic extends EventTarget {
    value?: DataView;
    startNotifications(): Promise<unknown>;
    stopNotifications(): Promise<unknown>;
  }
  interface Navigator {
    bluetooth?: {
      requestDevice(options: {
        filters?: Array<{ services: Array<number | string> }>;
        optionalServices?: Array<number | string>;
      }): Promise<BluetoothDevice>;
    };
  }
}

export function useHeartRateMonitor(recording: boolean): HeartRateMonitor {
  const [status, setStatus] = useState<HrStatus>("idle");
  const [bpm, setBpm] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);

  const samplesRef = useRef<HeartRateSample[]>([]);
  const recordingRef = useRef(recording);
  recordingRef.current = recording;

  const deviceRef = useRef<BluetoothDevice | null>(null);
  const charRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);

  const isSupported =
    typeof navigator !== "undefined" && !!navigator.bluetooth;

  const handleMeasurement = useCallback((event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic | null;
    const v = target?.value;
    if (!v) return;
    const flags = v.getUint8(0);
    const is16bit = (flags & 0x01) === 1;
    const reading = is16bit ? v.getUint16(1, true) : v.getUint8(1);
    if (reading <= 0 || reading > 250) return;
    setBpm(reading);
    if (recordingRef.current) {
      samplesRef.current.push({ timestamp: Date.now(), bpm: reading });
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    setStatus("idle");
    setDeviceName(null);
    setBpm(null);
    charRef.current = null;
    deviceRef.current = null;
  }, []);

  const teardown = useCallback(() => {
    const char = charRef.current;
    const device = deviceRef.current;
    if (char) {
      char.removeEventListener("characteristicvaluechanged", handleMeasurement);
      char.stopNotifications().catch(() => undefined);
    }
    if (device) {
      device.removeEventListener("gattserverdisconnected", handleDisconnect);
      if (device.gatt?.connected) device.gatt.disconnect();
    }
    charRef.current = null;
    deviceRef.current = null;
  }, [handleMeasurement, handleDisconnect]);

  const connect = useCallback(async () => {
    if (!isSupported || !navigator.bluetooth) {
      setStatus("error");
      setError("此瀏覽器不支援 Web Bluetooth（請改用 Android Chrome 或桌面 Chrome）。");
      return;
    }
    setStatus("connecting");
    setError(null);
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [HR_SERVICE] }],
      });
      device.addEventListener("gattserverdisconnected", handleDisconnect);
      if (!device.gatt) throw new Error("裝置不支援 GATT");
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(HR_SERVICE);
      const char = await service.getCharacteristic(HR_MEASUREMENT);
      await char.startNotifications();
      char.addEventListener("characteristicvaluechanged", handleMeasurement);
      deviceRef.current = device;
      charRef.current = char;
      setDeviceName(device.name ?? "心率帶");
      setStatus("connected");
    } catch (err) {
      // User-cancelled `requestDevice` throws a DOMException with name 'NotFoundError'.
      // Treat that as a benign return to idle rather than an error toast.
      if (err instanceof DOMException && err.name === "NotFoundError") {
        setStatus("idle");
        return;
      }
      const msg = err instanceof Error ? err.message : String(err);
      setStatus("error");
      setError(msg);
      teardown();
    }
  }, [isSupported, handleMeasurement, handleDisconnect, teardown]);

  const disconnect = useCallback(() => {
    teardown();
    setStatus("idle");
    setDeviceName(null);
    setBpm(null);
    setError(null);
  }, [teardown]);

  const resetSamples = useCallback(() => {
    samplesRef.current = [];
  }, []);

  useEffect(() => () => teardown(), [teardown]);

  return {
    status,
    bpm,
    error,
    deviceName,
    isSupported,
    samples: samplesRef.current,
    connect,
    disconnect,
    resetSamples,
  };
}

/** Summary stats useful for the saved session row. Returns undefineds when empty. */
export function summariseHeartRate(samples: HeartRateSample[]): {
  avg?: number;
  max?: number;
} {
  if (samples.length === 0) return {};
  let sum = 0;
  let max = 0;
  for (const s of samples) {
    sum += s.bpm;
    if (s.bpm > max) max = s.bpm;
  }
  return { avg: Math.round(sum / samples.length), max };
}
