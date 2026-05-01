"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Exercise, Workout, WorkoutSegment } from "@coach/shared-types";

import {
  beepCountdown,
  beepDone,
  beepRest,
  beepWorkStart,
  unlockAudio,
} from "./audio";
import { cancelSpeech, speak } from "./speech";

export type Phase =
  | { kind: "idle" }
  | { kind: "prepare"; remainingMs: number }
  | { kind: "work"; remainingMs: number; segIdx: number; roundIdx: number }
  | { kind: "rest"; remainingMs: number; segIdx: number; roundIdx: number }
  | { kind: "done" };

interface Cursor {
  segIdx: number;
  roundIdx: number;
  isRest: boolean;
}

interface EngineApi {
  phase: Phase;
  workout: Workout;
  segment: WorkoutSegment | null;
  exercise: Exercise | null;
  nextExercise: Exercise | null;
  totalElapsedMs: number;
  totalDurationMs: number;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  stop: () => void;
}

const PREPARE_MS = 5_000;
const TICK_MS = 100;

export function useWorkoutEngine(
  workout: Workout,
  exerciseMap: Map<string, Exercise> | undefined,
): EngineApi {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [isPaused, setIsPaused] = useState(false);
  const phaseRef = useRef<Phase>(phase);
  const pausedRef = useRef(false);
  phaseRef.current = phase;
  pausedRef.current = isPaused;

  const totalDurationMs = useMemo(
    () =>
      workout.segments.reduce(
        (acc, s) => acc + (s.durationSec + s.restAfterSec) * 1000 * s.rounds,
        0,
      ),
    [workout],
  );

  const [totalElapsedMs, setTotalElapsedMs] = useState(0);

  const segment = useMemo<WorkoutSegment | null>(() => {
    if (phase.kind === "work" || phase.kind === "rest") {
      return workout.segments[phase.segIdx] ?? null;
    }
    return null;
  }, [phase, workout]);

  const exercise = useMemo<Exercise | null>(() => {
    if (!segment || !exerciseMap) return null;
    return exerciseMap.get(segment.exerciseId) ?? null;
  }, [segment, exerciseMap]);

  const nextCursor = useMemo<Cursor | null>(() => {
    if (phase.kind !== "work" && phase.kind !== "rest") return null;
    return advanceCursor(workout, {
      segIdx: phase.segIdx,
      roundIdx: phase.roundIdx,
      isRest: phase.kind === "rest",
    });
  }, [phase, workout]);

  const nextExercise = useMemo<Exercise | null>(() => {
    if (!nextCursor || !exerciseMap) return null;
    const seg = workout.segments[nextCursor.segIdx];
    if (!seg) return null;
    return exerciseMap.get(seg.exerciseId) ?? null;
  }, [nextCursor, exerciseMap, workout]);

  // Tick loop
  useEffect(() => {
    if (phase.kind === "idle" || phase.kind === "done") return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const cur = phaseRef.current;
      if (cur.kind === "idle" || cur.kind === "done") return;

      const next = cur.remainingMs - TICK_MS;
      if (next > 0) {
        // countdown beeps at 3,2,1
        const prevSec = Math.ceil(cur.remainingMs / 1000);
        const nextSec = Math.ceil(next / 1000);
        if (prevSec !== nextSec && nextSec > 0 && nextSec <= 3) {
          beepCountdown();
        }
        setPhase({ ...cur, remainingMs: next });
        setTotalElapsedMs((t) => t + TICK_MS);
        return;
      }

      // phase finished — transition
      setTotalElapsedMs((t) => t + cur.remainingMs);
      transition(cur);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [phase.kind]);

  const transition = useCallback(
    (cur: Phase) => {
      if (cur.kind === "prepare") {
        const seg = workout.segments[0];
        if (!seg) {
          setPhase({ kind: "done" });
          beepDone();
          return;
        }
        announceWork(seg, exerciseMap);
        beepWorkStart();
        setPhase({
          kind: "work",
          segIdx: 0,
          roundIdx: 0,
          remainingMs: seg.durationSec * 1000,
        });
        return;
      }
      if (cur.kind === "work") {
        const seg = workout.segments[cur.segIdx];
        if (seg && seg.restAfterSec > 0) {
          beepRest();
          setPhase({
            kind: "rest",
            segIdx: cur.segIdx,
            roundIdx: cur.roundIdx,
            remainingMs: seg.restAfterSec * 1000,
          });
        } else {
          stepAfterRest(cur.segIdx, cur.roundIdx);
        }
        return;
      }
      if (cur.kind === "rest") {
        stepAfterRest(cur.segIdx, cur.roundIdx);
        return;
      }
    },
    // stepAfterRest is defined below; declare deps via closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workout, exerciseMap],
  );

  const stepAfterRest = useCallback(
    (segIdx: number, roundIdx: number) => {
      const seg = workout.segments[segIdx];
      if (!seg) {
        setPhase({ kind: "done" });
        beepDone();
        return;
      }
      const nextRound = roundIdx + 1;
      if (nextRound < seg.rounds) {
        announceWork(seg, exerciseMap);
        beepWorkStart();
        setPhase({
          kind: "work",
          segIdx,
          roundIdx: nextRound,
          remainingMs: seg.durationSec * 1000,
        });
        return;
      }
      const nextSeg = workout.segments[segIdx + 1];
      if (!nextSeg) {
        setPhase({ kind: "done" });
        beepDone();
        return;
      }
      announceWork(nextSeg, exerciseMap);
      beepWorkStart();
      setPhase({
        kind: "work",
        segIdx: segIdx + 1,
        roundIdx: 0,
        remainingMs: nextSeg.durationSec * 1000,
      });
    },
    [workout, exerciseMap],
  );

  const start = useCallback(() => {
    unlockAudio();
    setTotalElapsedMs(0);
    setPhase({ kind: "prepare", remainingMs: PREPARE_MS });
    speak("準備開始");
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
    cancelSpeech();
  }, []);

  const resume = useCallback(() => {
    unlockAudio();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    cancelSpeech();
    setIsPaused(false);
    setPhase({ kind: "idle" });
    setTotalElapsedMs(0);
  }, []);

  const skip = useCallback(() => {
    const cur = phaseRef.current;
    if (cur.kind === "prepare") {
      const seg = workout.segments[0];
      if (!seg) {
        setPhase({ kind: "done" });
        return;
      }
      announceWork(seg, exerciseMap);
      beepWorkStart();
      setPhase({
        kind: "work",
        segIdx: 0,
        roundIdx: 0,
        remainingMs: seg.durationSec * 1000,
      });
      return;
    }
    if (cur.kind === "work" || cur.kind === "rest") {
      transition({ ...cur, remainingMs: 0 });
    }
  }, [workout, exerciseMap, transition]);

  return {
    phase,
    workout,
    segment,
    exercise,
    nextExercise,
    totalElapsedMs,
    totalDurationMs,
    isPaused,
    start,
    pause,
    resume,
    skip,
    stop,
  };
}

function advanceCursor(workout: Workout, c: Cursor): Cursor | null {
  const seg = workout.segments[c.segIdx];
  if (!seg) return null;
  if (!c.isRest) {
    if (seg.restAfterSec > 0) {
      return { ...c, isRest: true };
    }
  }
  const nextRound = c.roundIdx + 1;
  if (nextRound < seg.rounds) {
    return { segIdx: c.segIdx, roundIdx: nextRound, isRest: false };
  }
  const nextSegIdx = c.segIdx + 1;
  if (nextSegIdx >= workout.segments.length) return null;
  return { segIdx: nextSegIdx, roundIdx: 0, isRest: false };
}

function announceWork(seg: WorkoutSegment, exerciseMap?: Map<string, Exercise>): void {
  const ex = exerciseMap?.get(seg.exerciseId);
  if (ex) {
    speak(ex.name);
  }
}
