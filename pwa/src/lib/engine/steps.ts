import type { Workout } from "@coach/shared-types";

export interface Step {
  kind: "work" | "rest";
  durationMs: number;
  segIdx: number;
  roundIdx: number;
  totalRoundsInSeg: number;
}

export const TABATA_WORK_MS = 20_000;
export const TABATA_REST_MS = 10_000;
export const TABATA_ROUNDS = 8;
export const EMOM_MINUTE_MS = 60_000;

/** Standard HIIT — each spec'd segment runs `rounds` times back-to-back. */
export function expandStandard(workout: Workout): Step[] {
  const out: Step[] = [];
  workout.segments.forEach((seg, segIdx) => {
    const rounds = Math.max(1, seg.rounds);
    for (let r = 0; r < rounds; r++) {
      out.push({
        kind: "work",
        durationMs: seg.durationSec * 1000,
        segIdx,
        roundIdx: r,
        totalRoundsInSeg: rounds,
      });
      if (seg.restAfterSec > 0) {
        out.push({
          kind: "rest",
          durationMs: seg.restAfterSec * 1000,
          segIdx,
          roundIdx: r,
          totalRoundsInSeg: rounds,
        });
      }
    }
  });
  return out;
}

/** Classic Tabata — fixed 20/10 × 8 rounds per spec'd action. */
export function expandTabata(workout: Workout): Step[] {
  const out: Step[] = [];
  workout.segments.forEach((_, segIdx) => {
    for (let r = 0; r < TABATA_ROUNDS; r++) {
      out.push({
        kind: "work",
        durationMs: TABATA_WORK_MS,
        segIdx,
        roundIdx: r,
        totalRoundsInSeg: TABATA_ROUNDS,
      });
      out.push({
        kind: "rest",
        durationMs: TABATA_REST_MS,
        segIdx,
        roundIdx: r,
        totalRoundsInSeg: TABATA_ROUNDS,
      });
    }
  });
  return out;
}

/** EMOM — every segment x rounds is one fixed 60-second work block. */
export function expandEmom(workout: Workout): Step[] {
  const out: Step[] = [];
  workout.segments.forEach((seg, segIdx) => {
    const rounds = Math.max(1, seg.rounds);
    for (let r = 0; r < rounds; r++) {
      out.push({
        kind: "work",
        durationMs: EMOM_MINUTE_MS,
        segIdx,
        roundIdx: r,
        totalRoundsInSeg: rounds,
      });
    }
  });
  return out;
}

/** AMRAP doesn't materialise a step list; consumer queries by index. */
export function amrapStepsLoop(_workout: Workout): Step[] {
  return [];
}

/** Returns the work step at logical `idx` cycling through segments. */
export function amrapStepAt(workout: Workout, idx: number): Step | null {
  if (workout.segments.length === 0) return null;
  const segIdx = idx % workout.segments.length;
  const seg = workout.segments[segIdx];
  if (!seg) return null;
  return {
    kind: "work",
    durationMs: seg.durationSec * 1000,
    segIdx,
    roundIdx: 0,
    totalRoundsInSeg: 1,
  };
}
