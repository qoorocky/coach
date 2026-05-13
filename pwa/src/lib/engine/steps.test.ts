import { describe, expect, it } from "vitest";
import type { Workout, WorkoutMode, WorkoutSegment } from "@coach/shared-types";

import {
  amrapStepAt,
  amrapStepsLoop,
  EMOM_MINUTE_MS,
  expandEmom,
  expandStandard,
  expandTabata,
  TABATA_REST_MS,
  TABATA_ROUNDS,
  TABATA_WORK_MS,
} from "./steps";

function makeSegment(
  partial: Partial<WorkoutSegment> & Pick<WorkoutSegment, "durationSec">,
): WorkoutSegment {
  return {
    segmentId: partial.segmentId ?? "seg",
    exerciseId: partial.exerciseId ?? "ex",
    orderIndex: partial.orderIndex ?? 0,
    durationSec: partial.durationSec,
    restAfterSec: partial.restAfterSec ?? 0,
    rounds: partial.rounds ?? 1,
  };
}

function makeWorkout(mode: WorkoutMode, segments: WorkoutSegment[]): Workout {
  return {
    id: "w",
    name: "w",
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

describe("expandStandard", () => {
  it("emits one work step per round + a rest step when restAfterSec > 0", () => {
    const w = makeWorkout("standard", [
      makeSegment({ segmentId: "a", durationSec: 30, restAfterSec: 15, rounds: 2 }),
      makeSegment({ segmentId: "b", durationSec: 40, restAfterSec: 0, rounds: 1, orderIndex: 1 }),
    ]);
    const steps = expandStandard(w);

    // First segment: work/rest/work/rest = 4 steps. Second: 1 work, no rest.
    expect(steps).toHaveLength(5);
    expect(steps[0]).toMatchObject({ kind: "work", durationMs: 30_000, segIdx: 0, roundIdx: 0 });
    expect(steps[1]).toMatchObject({ kind: "rest", durationMs: 15_000, segIdx: 0, roundIdx: 0 });
    expect(steps[2]).toMatchObject({ kind: "work", segIdx: 0, roundIdx: 1 });
    expect(steps[4]).toMatchObject({ kind: "work", durationMs: 40_000, segIdx: 1, roundIdx: 0 });
  });

  it("clamps rounds=0 up to 1 to avoid swallowing a segment", () => {
    const w = makeWorkout("standard", [
      makeSegment({ durationSec: 20, rounds: 0 }),
    ]);
    const steps = expandStandard(w);
    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({ kind: "work", durationMs: 20_000 });
  });
});

describe("expandTabata", () => {
  it("emits 8 work + 8 rest steps per segment with fixed 20/10s timing", () => {
    const w = makeWorkout("tabata", [
      makeSegment({ segmentId: "a", durationSec: 99, restAfterSec: 99, rounds: 99 }),
      makeSegment({ segmentId: "b", durationSec: 1, orderIndex: 1 }),
    ]);
    const steps = expandTabata(w);
    expect(steps).toHaveLength(TABATA_ROUNDS * 2 * 2);

    // Spec'd segment durations / rests / rounds are ignored — Tabata is fixed.
    const workSteps = steps.filter((s) => s.kind === "work");
    const restSteps = steps.filter((s) => s.kind === "rest");
    expect(workSteps.every((s) => s.durationMs === TABATA_WORK_MS)).toBe(true);
    expect(restSteps.every((s) => s.durationMs === TABATA_REST_MS)).toBe(true);
    expect(workSteps.every((s) => s.totalRoundsInSeg === TABATA_ROUNDS)).toBe(true);
  });
});

describe("expandEmom", () => {
  it("emits one 60-second work step per round, no rest", () => {
    const w = makeWorkout("emom", [
      makeSegment({ durationSec: 30, rounds: 3 }),
      makeSegment({ durationSec: 1, rounds: 2, orderIndex: 1 }),
    ]);
    const steps = expandEmom(w);
    expect(steps).toHaveLength(5);
    expect(steps.every((s) => s.kind === "work")).toBe(true);
    expect(steps.every((s) => s.durationMs === EMOM_MINUTE_MS)).toBe(true);
  });
});

describe("amrap", () => {
  it("amrapStepsLoop returns empty — engine queries by index instead", () => {
    const w = makeWorkout("amrap", [
      makeSegment({ durationSec: 60 }),
    ]);
    expect(amrapStepsLoop(w)).toEqual([]);
  });

  it("amrapStepAt cycles through segments modulo segment count", () => {
    const w = makeWorkout("amrap", [
      makeSegment({ segmentId: "a", durationSec: 30 }),
      makeSegment({ segmentId: "b", durationSec: 45, orderIndex: 1 }),
    ]);
    expect(amrapStepAt(w, 0)).toMatchObject({ segIdx: 0, durationMs: 30_000 });
    expect(amrapStepAt(w, 1)).toMatchObject({ segIdx: 1, durationMs: 45_000 });
    expect(amrapStepAt(w, 2)).toMatchObject({ segIdx: 0, durationMs: 30_000 });
    expect(amrapStepAt(w, 7)).toMatchObject({ segIdx: 1 });
  });

  it("amrapStepAt returns null when the workout has no segments", () => {
    const w = makeWorkout("amrap", []);
    expect(amrapStepAt(w, 0)).toBeNull();
  });
});
