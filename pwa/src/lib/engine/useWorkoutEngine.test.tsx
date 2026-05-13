import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Workout, WorkoutMode, WorkoutSegment } from "@coach/shared-types";

// Silence the audio/speech side-effects — none of these write any real
// observable state for the engine; we only care about phase transitions.
vi.mock("./audio", () => ({
  beepCountdown: vi.fn(),
  beepDone: vi.fn(),
  beepRest: vi.fn(),
  beepWorkStart: vi.fn(),
  unlockAudio: vi.fn(),
}));
vi.mock("./speech", () => ({
  speak: vi.fn(),
  cancelSpeech: vi.fn(),
}));
vi.mock("../settings/store", () => ({
  // Engine reads prepareSec; force it to 0 to make every test enter the
  // first work step the moment `start()` runs.
  getCurrentSettings: () => ({
    voiceEnabled: false,
    beepEnabled: false,
    beepVolume: 0,
    prepareSec: 0,
    unit: "km",
  }),
}));

import { useWorkoutEngine } from "./useWorkoutEngine";

function seg(
  partial: Partial<WorkoutSegment> & Pick<WorkoutSegment, "segmentId" | "durationSec">,
): WorkoutSegment {
  return {
    segmentId: partial.segmentId,
    exerciseId: partial.exerciseId ?? `ex-${partial.segmentId}`,
    orderIndex: partial.orderIndex ?? 0,
    durationSec: partial.durationSec,
    restAfterSec: partial.restAfterSec ?? 0,
    rounds: partial.rounds ?? 1,
  };
}

function workoutOf(mode: WorkoutMode, segments: WorkoutSegment[]): Workout {
  return {
    id: "w-test",
    name: "test",
    description: "",
    coverImageUrl: "",
    difficulty: "beginner",
    mode,
    estimatedDurationSec: 0,
    estimatedCalories: 0,
    segments,
    tags: [],
    trackIds: [],
    createdBy: "system",
    version: 1,
    updatedAt: 0,
    createdAt: 0,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/**
 * Engine's tick loop reads state via refs that only update after each render.
 * If we advance the fake clock in one big chunk, all queued setInterval
 * callbacks fire before React flushes, so the second+ ticks see stale refs.
 * Step the clock one tick at a time and wrap each in `act()` instead.
 */
function tickFor(ms: number, tickMs = 100): void {
  const ticks = Math.ceil(ms / tickMs);
  for (let i = 0; i < ticks; i++) {
    act(() => {
      vi.advanceTimersByTime(tickMs);
    });
  }
}

describe("useWorkoutEngine — standard mode", () => {
  it("start() enters first work step when prepare = 0s", () => {
    const w = workoutOf("standard", [
      seg({ segmentId: "a", durationSec: 5, restAfterSec: 0 }),
    ]);
    const { result } = renderHook(() => useWorkoutEngine(w, new Map()));

    expect(result.current.phase.kind).toBe("idle");
    act(() => {
      result.current.start();
    });
    expect(result.current.phase.kind).toBe("work");
  });

  it("ticks down a work step and advances to done at end", () => {
    const w = workoutOf("standard", [
      seg({ segmentId: "a", durationSec: 1, restAfterSec: 0 }),
    ]);
    const { result } = renderHook(() => useWorkoutEngine(w, new Map()));
    act(() => {
      result.current.start();
    });
    // Drain the 1000ms work step.
    tickFor(1100);
    expect(result.current.phase.kind).toBe("done");
  });

  it("pause() halts the tick loop; resume() continues from where it left off", () => {
    const w = workoutOf("standard", [
      seg({ segmentId: "a", durationSec: 2, restAfterSec: 0 }),
    ]);
    const { result } = renderHook(() => useWorkoutEngine(w, new Map()));
    act(() => {
      result.current.start();
    });
    tickFor(500);
    const remainingBeforePause =
      result.current.phase.kind === "work"
        ? result.current.phase.remainingMs
        : -1;
    expect(remainingBeforePause).toBeGreaterThan(0);

    act(() => {
      result.current.pause();
    });
    tickFor(2000);
    const remainingWhilePaused =
      result.current.phase.kind === "work"
        ? result.current.phase.remainingMs
        : -1;
    expect(remainingWhilePaused).toBe(remainingBeforePause);

    act(() => {
      result.current.resume();
    });
    tickFor(1700);
    expect(result.current.phase.kind).toBe("done");
  });

  it("skip() advances to the next step and records the partial as skipped", () => {
    const w = workoutOf("standard", [
      seg({ segmentId: "a", durationSec: 10, restAfterSec: 0 }),
      seg({ segmentId: "b", durationSec: 10, restAfterSec: 0, orderIndex: 1 }),
    ]);
    const { result } = renderHook(() => useWorkoutEngine(w, new Map()));
    act(() => {
      result.current.start();
    });
    tickFor(3000);
    act(() => {
      result.current.skip();
    });
    // We should now be in segment B's work step.
    expect(result.current.phase.kind).toBe("work");
    if (result.current.phase.kind === "work") {
      expect(result.current.phase.segIdx).toBe(1);
    }

    const completed = result.current.getCompletedSegments();
    const a = completed.find((c) => c.segmentId === "a");
    expect(a).toBeDefined();
    expect(a!.wasSkipped).toBe(true);
    // Skipped after ~3s of a 10s segment.
    expect(a!.actualDurationMs).toBeGreaterThan(2500);
    expect(a!.actualDurationMs).toBeLessThan(3500);
  });

  it("stop() returns to idle and marks the in-flight work step as skipped", () => {
    const w = workoutOf("standard", [
      seg({ segmentId: "a", durationSec: 10, restAfterSec: 0 }),
    ]);
    const { result } = renderHook(() => useWorkoutEngine(w, new Map()));
    act(() => {
      result.current.start();
    });
    tickFor(1000);
    act(() => {
      result.current.stop();
    });
    expect(result.current.phase.kind).toBe("idle");
    expect(result.current.totalElapsedMs).toBe(0);

    const completed = result.current.getCompletedSegments();
    expect(completed[0]).toMatchObject({
      segmentId: "a",
      wasSkipped: true,
    });
  });
});

describe("useWorkoutEngine — multi-round segments", () => {
  it("records actualDurationMs across rounds for the same segment", () => {
    const w = workoutOf("standard", [
      seg({ segmentId: "a", durationSec: 1, restAfterSec: 0, rounds: 3 }),
    ]);
    const { result } = renderHook(() => useWorkoutEngine(w, new Map()));
    act(() => {
      result.current.start();
    });
    tickFor(3500);
    expect(result.current.phase.kind).toBe("done");

    const completed = result.current.getCompletedSegments();
    expect(completed).toHaveLength(1);
    // 3 rounds × 1s, allowing one tick of slop on either side.
    expect(completed[0].actualDurationMs).toBeGreaterThanOrEqual(2900);
    expect(completed[0].actualDurationMs).toBeLessThanOrEqual(3100);
    expect(completed[0].wasSkipped).toBe(false);
  });
});

describe("useWorkoutEngine — AMRAP", () => {
  it("uses estimatedDurationSec as the master clock and ends when it runs out", () => {
    const w = workoutOf("amrap", [
      seg({ segmentId: "a", durationSec: 1 }),
      seg({ segmentId: "b", durationSec: 1, orderIndex: 1 }),
    ]);
    w.estimatedDurationSec = 3;
    const { result } = renderHook(() => useWorkoutEngine(w, new Map()));
    act(() => {
      result.current.start();
    });
    tickFor(3500);
    expect(result.current.phase.kind).toBe("done");
  });
});
