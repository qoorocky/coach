"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CompletedSegment,
  Exercise,
  Workout,
  WorkoutMode,
  WorkoutSegment,
} from "@coach/shared-types";

import {
  beepCountdown,
  beepDone,
  beepRest,
  beepWorkStart,
  unlockAudio,
} from "./audio";
import { cancelSpeech, speak } from "./speech";
import { getCurrentSettings } from "../settings/store";
import {
  amrapStepAt,
  amrapStepsLoop,
  expandEmom,
  expandStandard,
  expandTabata,
  type Step,
} from "./steps";

export type { Step } from "./steps";

export type Phase =
  | { kind: "idle" }
  | { kind: "prepare"; remainingMs: number }
  | {
      kind: "work" | "rest";
      remainingMs: number;
      segIdx: number;
      roundIdx: number;
      totalRoundsInSeg: number;
    }
  | { kind: "done" };

interface EngineApi {
  phase: Phase;
  workout: Workout;
  mode: WorkoutMode;
  segment: WorkoutSegment | null;
  exercise: Exercise | null;
  nextExercise: Exercise | null;
  totalElapsedMs: number;
  totalDurationMs: number;
  totalRemainingMs: number;
  amrapRound: number;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;
  stop: () => void;
  getCompletedSegments: () => CompletedSegment[];
}

interface CompletedAcc {
  segmentId: string;
  orderIndex: number;
  actualMs: number;
  skipped: boolean;
}

const TICK_MS = 100;

export function useWorkoutEngine(
  workout: Workout,
  exerciseMap: Map<string, Exercise> | undefined,
): EngineApi {
  const mode: WorkoutMode = workout.mode ?? "standard";
  const isAmrap = mode === "amrap";

  const steps = useMemo<Step[]>(() => {
    if (isAmrap) return amrapStepsLoop(workout);
    if (mode === "tabata") return expandTabata(workout);
    if (mode === "emom") return expandEmom(workout);
    return expandStandard(workout);
  }, [workout, mode, isAmrap]);

  const totalDurationMs = useMemo(() => {
    if (isAmrap) return Math.max(0, workout.estimatedDurationSec * 1000);
    return steps.reduce((acc, s) => acc + s.durationMs, 0);
  }, [steps, isAmrap, workout.estimatedDurationSec]);

  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [stepIdx, setStepIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [totalElapsedMs, setTotalElapsedMs] = useState(0);

  const phaseRef = useRef<Phase>(phase);
  const pausedRef = useRef(false);
  const stepIdxRef = useRef(0);
  const stepsRef = useRef<Step[]>(steps);
  const completedRef = useRef<Map<number, CompletedAcc>>(new Map());
  phaseRef.current = phase;
  pausedRef.current = isPaused;
  stepIdxRef.current = stepIdx;
  stepsRef.current = steps;

  const totalRemainingMs = isAmrap
    ? Math.max(0, totalDurationMs - totalElapsedMs)
    : Math.max(0, totalDurationMs - totalElapsedMs);

  const amrapRound = useMemo(() => {
    if (!isAmrap || workout.segments.length === 0) return 0;
    return Math.floor(stepIdx / workout.segments.length) + (
      phase.kind === "work" || phase.kind === "rest" ? 1 : 0
    );
  }, [isAmrap, stepIdx, workout.segments.length, phase.kind]);

  const segment = useMemo<WorkoutSegment | null>(() => {
    if (phase.kind !== "work" && phase.kind !== "rest") return null;
    return workout.segments[phase.segIdx] ?? null;
  }, [phase, workout]);

  const exercise = useMemo<Exercise | null>(() => {
    if (!segment || !exerciseMap) return null;
    return exerciseMap.get(segment.exerciseId) ?? null;
  }, [segment, exerciseMap]);

  const nextExercise = useMemo<Exercise | null>(() => {
    if (phase.kind !== "work" && phase.kind !== "rest") return null;
    let cursor = stepIdx + 1;
    while (true) {
      if (!isAmrap && cursor >= steps.length) return null;
      const s = isAmrap
        ? amrapStepAt(workout, cursor)
        : steps[cursor];
      if (!s) return null;
      if (s.kind === "work") {
        const seg = workout.segments[s.segIdx];
        if (!seg) return null;
        return exerciseMap?.get(seg.exerciseId) ?? null;
      }
      cursor++;
      if (isAmrap && cursor > 1000) return null; // safety
    }
  }, [phase.kind, stepIdx, steps, isAmrap, workout, exerciseMap]);

  const enterStep = useCallback(
    (idx: number) => {
      const s = isAmrap ? amrapStepAt(workout, idx) : steps[idx];
      if (!s) {
        setPhase({ kind: "done" });
        beepDone();
        return;
      }
      if (s.kind === "work") {
        const seg = workout.segments[s.segIdx];
        if (seg) {
          const ex = exerciseMap?.get(seg.exerciseId);
          if (ex) speak(ex.name);
        }
        beepWorkStart();
      } else {
        beepRest();
      }
      setStepIdx(idx);
      setPhase({
        kind: s.kind,
        segIdx: s.segIdx,
        roundIdx: s.roundIdx,
        totalRoundsInSeg: s.totalRoundsInSeg,
        remainingMs: s.durationMs,
      });
    },
    [steps, workout, exerciseMap, isAmrap],
  );

  const recordStepExit = useCallback(
    (skipped: boolean, naturalCompletion = false) => {
      const cur = phaseRef.current;
      // Only WORK steps count toward completedSegments; rest is implicit
      // between rounds and isn't a discrete spec'd unit.
      if (cur.kind !== "work") return;
      const seg = workout.segments[cur.segIdx];
      if (!seg) return;
      const step = isAmrap
        ? amrapStepAt(workout, stepIdxRef.current)
        : stepsRef.current[stepIdxRef.current];
      if (!step) return;
      // On natural completion the tick that fires this still carries the
      // pre-tick `remainingMs` (~TICK_MS), so subtracting would under-count
      // every round by one tick. Treat naturally-completed steps as full.
      const elapsed = naturalCompletion
        ? step.durationMs
        : Math.max(0, step.durationMs - cur.remainingMs);
      const map = completedRef.current;
      const existing = map.get(cur.segIdx);
      if (existing) {
        existing.actualMs += elapsed;
        if (skipped) existing.skipped = true;
      } else {
        map.set(cur.segIdx, {
          segmentId: seg.segmentId,
          orderIndex: seg.orderIndex,
          actualMs: elapsed,
          skipped,
        });
      }
    },
    [workout, isAmrap],
  );

  const advance = useCallback(() => {
    const next = stepIdxRef.current + 1;
    if (isAmrap && totalElapsedMs >= totalDurationMs) {
      setPhase({ kind: "done" });
      beepDone();
      return;
    }
    enterStep(next);
  }, [enterStep, isAmrap, totalElapsedMs, totalDurationMs]);

  // Tick loop
  useEffect(() => {
    if (phase.kind === "idle" || phase.kind === "done") return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const cur = phaseRef.current;
      if (cur.kind === "idle" || cur.kind === "done") return;

      const next = cur.remainingMs - TICK_MS;

      // AMRAP: stop when total clock runs out, regardless of phase
      if (isAmrap && cur.kind !== "prepare") {
        const newElapsed = totalElapsedMs + TICK_MS;
        if (newElapsed >= totalDurationMs) {
          // AMRAP master-clock timeout cuts mid-step — record actual elapsed,
          // not the full planned duration.
          recordStepExit(false);
          setTotalElapsedMs(totalDurationMs);
          setPhase({ kind: "done" });
          beepDone();
          return;
        }
      }

      if (next > 0) {
        const prevSec = Math.ceil(cur.remainingMs / 1000);
        const nextSec = Math.ceil(next / 1000);
        if (prevSec !== nextSec && nextSec > 0 && nextSec <= 3) {
          beepCountdown();
        }
        setPhase({ ...cur, remainingMs: next });
        setTotalElapsedMs((t) => t + TICK_MS);
        return;
      }

      setTotalElapsedMs((t) => t + cur.remainingMs);
      if (cur.kind === "prepare") {
        enterStep(0);
        return;
      }
      recordStepExit(false, true);
      advance();
    }, TICK_MS);
    return () => clearInterval(id);
  }, [phase.kind, isAmrap, totalDurationMs, totalElapsedMs, enterStep, advance, recordStepExit]);

  const start = useCallback(() => {
    unlockAudio();
    setStepIdx(0);
    setTotalElapsedMs(0);
    completedRef.current.clear();
    const prepareMs = getCurrentSettings().prepareSec * 1000;
    if (prepareMs <= 0) {
      enterStep(0);
    } else {
      setPhase({ kind: "prepare", remainingMs: prepareMs });
      speak("準備開始");
    }
  }, [enterStep]);

  const pause = useCallback(() => {
    setIsPaused(true);
    cancelSpeech();
  }, []);

  const resume = useCallback(() => {
    unlockAudio();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    recordStepExit(true);
    cancelSpeech();
    setIsPaused(false);
    setStepIdx(0);
    setPhase({ kind: "idle" });
    setTotalElapsedMs(0);
  }, [recordStepExit]);

  const skip = useCallback(() => {
    const cur = phaseRef.current;
    if (cur.kind === "prepare") {
      enterStep(0);
      return;
    }
    if (cur.kind === "work" || cur.kind === "rest") {
      if (cur.kind === "work") recordStepExit(true);
      advance();
    }
  }, [enterStep, advance, recordStepExit]);

  const getCompletedSegments = useCallback((): CompletedSegment[] => {
    return Array.from(completedRef.current.values())
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(({ segmentId, orderIndex, actualMs, skipped }) => ({
        segmentId,
        orderIndex,
        actualDurationMs: actualMs,
        wasSkipped: skipped,
      }));
  }, []);

  return {
    phase,
    workout,
    mode,
    segment,
    exercise,
    nextExercise,
    totalElapsedMs,
    totalDurationMs,
    totalRemainingMs,
    amrapRound,
    isPaused,
    start,
    pause,
    resume,
    skip,
    stop,
    getCompletedSegments,
  };
}

